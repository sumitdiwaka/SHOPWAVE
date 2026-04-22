import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { sendEmail, orderConfirmationEmail, vendorNewOrderEmail } from '../utils/sendEmail.js';
import { createNotification } from './notificationController.js';

// @desc   Create order
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!items || items.length === 0) throw new AppError('No order items', 400);

  const orderItems = [];
  let itemsPrice = 0;

  // Map vendorId → items for that vendor (for per-vendor notifications)
  const vendorItemsMap = {};

  for (const item of items) {
    const product = await Product.findById(item.product).populate('vendor');
    if (!product) throw new AppError(`Product ${item.product} not found`, 404);
    if (product.stock < item.quantity) throw new AppError(`${product.name} is out of stock`, 400);

    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    const orderItem = {
      product: product._id,
      vendor: product.vendor._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price,
      quantity: item.quantity,
    };

    orderItems.push(orderItem);
    itemsPrice += price * item.quantity;

    // Group items by vendor
    const vendorId = product.vendor._id.toString();
    if (!vendorItemsMap[vendorId]) {
      vendorItemsMap[vendorId] = {
        vendorDoc: product.vendor,
        items: [],
      };
    }
    vendorItemsMap[vendorId].items.push(orderItem);
  }

  const shippingPrice = itemsPrice > 999 ? 0 : 49;
  const taxPrice      = Math.round(itemsPrice * 0.18);
  const totalPrice    = itemsPrice + shippingPrice + taxPrice;

  const order = await Order.create({
    customer: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentInfo: { method: paymentMethod || 'razorpay', status: 'pending' },
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    statusHistory: [{ status: 'placed', message: 'Order placed successfully' }],
  });

  // ── Decrement stock ──
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, sold: item.quantity },
    });
  }

  // ── Real-time socket ──
  req.io?.emit('orderCreated', { orderId: order._id, customerId: req.user._id });

  // ── Customer confirmation email ──
  try { await sendEmail(orderConfirmationEmail(order, req.user)); }
  catch (e) { console.error('Customer order email failed:', e.message); }

  // ── Customer in-app notification ──
  await createNotification({
    recipient: req.user._id,
    type: 'order_placed',
    title: 'Order Placed Successfully!',
    message: `Your order #${order._id.toString().slice(-8).toUpperCase()} for ₹${totalPrice.toLocaleString('en-IN')} has been placed. Track it in My Orders.`,
    link: `/account/orders/${order._id}`,
    meta: { orderId: order._id },
  });

  // ── Notify each vendor who has items in this order ──
  for (const [vendorId, { vendorDoc, items: vItems }] of Object.entries(vendorItemsMap)) {
    // Get vendor's user account
    const vendorUser = await User.findById(vendorDoc.user);
    if (!vendorUser) continue;

    // In-app notification for vendor
    await createNotification({
      recipient: vendorDoc.user,
      type: 'order_placed',
      title: `New Order Received! 🛍️`,
      message: `${req.user.name} placed an order for ${vItems.length} item(s) from your shop. Confirm and process it now.`,
      link: '/vendor/orders',
      meta: { orderId: order._id },
    });

    // Real-time socket notification to vendor's room
    req.io?.to(`user_${vendorDoc.user.toString()}`).emit('newOrder', {
      orderId: order._id,
      customerName: req.user.name,
      itemCount: vItems.length,
    });

    // Email to vendor
    try {
      await sendEmail(vendorNewOrderEmail(vendorUser, order, vItems));
    } catch (e) { console.error(`Vendor order email failed for ${vendorUser.email}:`, e.message); }
  }

  res.status(201).json({ success: true, order });
});

// @desc   Get my orders (customer)
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc   Get single order
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('items.product', 'name images price')
    .populate('items.vendor', 'shopName');

  if (!order) throw new AppError('Order not found', 404);

  const isOwner = order.customer._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) throw new AppError('Not authorized', 403);

  res.json({ success: true, order });
});

// @desc   Update order status (vendor/admin) + notify customer
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message } = req.body;
  const order = await Order.findById(req.params.id).populate('customer', 'name email _id');
  if (!order) throw new AppError('Order not found', 404);

  const ALL_STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const isAdmin      = req.user.role === 'admin';
  const finalStates  = ['delivered', 'cancelled', 'refunded'];

  if (!isAdmin && finalStates.includes(order.orderStatus)) {
    throw new AppError(`Cannot change status from ${order.orderStatus}`, 400);
  }
  if (!ALL_STATUSES.includes(status)) throw new AppError(`Invalid status: ${status}`, 400);

  const prevStatus   = order.orderStatus;
  order.orderStatus  = status;
  order.statusHistory.push({
    status,
    message: message || `Order status changed from ${prevStatus} to ${status}`,
  });

  if (status === 'delivered') order.deliveredAt = Date.now();
  if (status === 'cancelled') order.cancelledAt = Date.now();
  await order.save();

  // ── Real-time update to customer ──
  req.io?.to(order._id.toString()).emit('orderStatusUpdated', { orderId: order._id, status });
  req.io?.to(`user_${order.customer._id.toString()}`).emit('orderStatusUpdated', {
    orderId: order._id, status,
  });

  // ── In-app notification to customer ──
  const statusMessages = {
    confirmed:  'Your order has been confirmed by the vendor!',
    processing: 'Your order is being packed and prepared for shipping.',
    shipped:    'Great news! Your order is on its way. Track it in My Orders.',
    delivered:  'Your order has been delivered! Enjoy your purchase. You can now write a review.',
    cancelled:  'Your order has been cancelled.',
  };

  if (order.customer?._id && statusMessages[status]) {
    await createNotification({
      recipient: order.customer._id,
      type: 'order_status',
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Order #${order._id.toString().slice(-8).toUpperCase()}: ${statusMessages[status]}`,
      link: `/account/orders/${order._id}`,
      meta: { orderId: order._id, status },
    });
  }

  res.json({ success: true, order });
});

// @desc   Cancel order (customer)
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);
  if (order.customer.toString() !== req.user._id.toString()) throw new AppError('Not authorized', 403);
  if (!['placed', 'confirmed'].includes(order.orderStatus)) {
    throw new AppError('Order cannot be cancelled at this stage. Contact support.', 400);
  }

  order.orderStatus       = 'cancelled';
  order.cancelledAt       = Date.now();
  order.cancellationReason = req.body.reason || 'Cancelled by customer';
  order.statusHistory.push({ status: 'cancelled', message: order.cancellationReason });

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, sold: -item.quantity },
    });
  }

  await order.save();

  // Notify all vendors for this order
  const vendorIds = [...new Set(order.items.map((i) => i.vendor.toString()))];
  for (const vendorId of vendorIds) {
    const vendor = await Vendor.findById(vendorId);
    if (vendor?.user) {
      await createNotification({
        recipient: vendor.user,
        type: 'order_status',
        title: 'Order Cancelled by Customer',
        message: `Order #${order._id.toString().slice(-8).toUpperCase()} has been cancelled by the customer.`,
        link: '/vendor/orders',
        meta: { orderId: order._id },
      });
    }
  }

  res.json({ success: true, order });
});

// @desc   Get vendor's orders
export const getVendorOrders = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) throw new AppError('Vendor not found', 404);

  const orders = await Order.find({ 'items.vendor': vendor._id })
    .populate('customer', 'name email')
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
});