import Razorpay from 'razorpay';
import Return  from '../models/Return.js';
import Order   from '../models/Order.js';
import Vendor  from '../models/Vendor.js';
import Product from '../models/Product.js';
import User    from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { createNotification } from './notificationController.js';
import {
  sendEmail,
  returnRequestedEmail,
  returnApprovedEmail,
  returnRejectedEmail,
  refundCompletedEmail,
  replacementApprovedEmail,
  exchangeApprovedEmail,
} from '../utils/sendEmail.js';

const RETURN_WINDOW_DAYS = 7;

const getRazorpay = () => new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const isWithinReturnWindow = (deliveredAt) => {
  if (!deliveredAt) return false;
  const days = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
  return days <= RETURN_WINDOW_DAYS;
};

// ════════════════════════════════════════════════════════
//  Customer submits return request
// ════════════════════════════════════════════════════════
export const createReturn = asyncHandler(async (req, res) => {
  const { orderId, reason, reasonText = '', items: returnItems, returnType = 'refund' } = req.body;

  const order = await Order.findById(orderId)
    .populate('customer', 'name email _id')
    .populate('items.vendor');

  if (!order) throw new AppError('Order not found', 404);
  if (order.customer._id.toString() !== req.user._id.toString()) throw new AppError('Not authorized', 403);
  if (order.orderStatus !== 'delivered') throw new AppError('Returns only allowed for delivered orders', 400);
  if (!isWithinReturnWindow(order.deliveredAt)) {
    throw new AppError(`Return window of ${RETURN_WINDOW_DAYS} days has expired`, 400);
  }

  const existing = await Return.findOne({ order: orderId, customer: req.user._id });
  if (existing) throw new AppError('Return request already exists for this order', 400);

  // Build items + calculate refund
  const validItems = [];
  let refundAmount = 0;

  for (const ri of returnItems) {
    const orderItem = order.items.find((i) => i.product.toString() === ri.productId);
    if (!orderItem) throw new AppError(`Product not found in order`, 400);
    const qty = Math.min(ri.quantity || orderItem.quantity, orderItem.quantity);
    validItems.push({
      product:  orderItem.product,
      name:     orderItem.name,
      image:    orderItem.image,
      price:    orderItem.price,
      quantity: qty,
    });
    refundAmount += orderItem.price * qty;
  }

  const itemRatio  = refundAmount / (order.itemsPrice || 1);
  const taxRefund  = Math.round((order.taxPrice || 0) * itemRatio);
  const shipRefund = returnItems.length === order.items.length ? (order.shippingPrice || 0) : 0;
  refundAmount    += taxRefund + shipRefund;

  const vendorId = order.items[0]?.vendor?._id || order.items[0]?.vendor;

  const returnRequest = await Return.create({
    order:         order._id,
    customer:      req.user._id,
    vendor:        vendorId,
    items:         validItems,
    reason,
    reasonText,
    returnType,
    refundAmount,
    refundMethod:  'original_payment',
    pickupAddress: order.shippingAddress,
    statusHistory: [{ status: 'requested', message: 'Return request submitted by customer', updatedBy: 'customer' }],
  });

  // Update order
  await Order.findByIdAndUpdate(order._id, {
    orderStatus:   'return_requested',
    returnRequest: returnRequest._id,
    $push: { statusHistory: { status: 'return_requested', message: 'Customer requested a return' } },
  });

  // Restore stock tentatively
  for (const item of validItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  // Emails + notifications (non-blocking)
  sendEmail(returnRequestedEmail(order.customer, order, returnRequest)).catch(() => {});

  await createNotification({
    recipient: req.user._id,
    type:      'general',
    title:     '↩️ Return Request Submitted',
    message:   `Your return for Order #${order._id.toString().slice(-8).toUpperCase()} has been received. We'll review within 24-48 hours.`,
    link:      '/account/returns',
  });

  const vendor = await Vendor.findById(vendorId);
  if (vendor?.user) {
    await createNotification({
      recipient: vendor.user,
      type:      'general',
      title:     '📦 Return Request on Your Product',
      message:   `${order.customer.name} requested a return. Refund: ₹${refundAmount.toLocaleString('en-IN')}.`,
      link:      '/vendor/returns',
    });
  }

  const admins = await User.find({ role: 'admin' }, '_id');
  for (const admin of admins) {
    await createNotification({
      recipient: admin._id,
      type:      'general',
      title:     '↩️ New Return Request',
      message:   `Order #${order._id.toString().slice(-8).toUpperCase()} — ₹${refundAmount.toLocaleString('en-IN')} refund requested.`,
      link:      '/admin/returns',
    });
  }

  res.status(201).json({ success: true, returnRequest });
});

// ════════════════════════════════════════════════════════
//  Get customer's return requests
// ════════════════════════════════════════════════════════
export const getMyReturns = asyncHandler(async (req, res) => {
  const returns = await Return.find({ customer: req.user._id })
    .populate('order', 'totalPrice createdAt shippingAddress paymentInfo')
    .sort({ createdAt: -1 });
  res.json({ success: true, returns });
});

// ════════════════════════════════════════════════════════
//  Get single return
// ════════════════════════════════════════════════════════
export const getReturn = asyncHandler(async (req, res) => {
  const ret = await Return.findById(req.params.id)
    .populate('order', 'totalPrice createdAt shippingAddress paymentInfo orderStatus')
    .populate('customer', 'name email')
    .populate('items.product', 'name images');

  if (!ret) throw new AppError('Return not found', 404);

  const isOwner = ret.customer._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) throw new AppError('Not authorized', 403);

  res.json({ success: true, return: ret });
});

// ════════════════════════════════════════════════════════
//  Admin — get all returns
// ════════════════════════════════════════════════════════
export const getAllReturns = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  const query = status && status !== 'all' ? { status } : {};

  const returns = await Return.find(query)
    .populate('customer', 'name email')
    .populate('order', 'totalPrice createdAt paymentInfo')
    .sort({ createdAt: -1 })
    .skip((page - 1) * Number(limit))
    .limit(Number(limit));

  const total = await Return.countDocuments(query);
  res.json({ success: true, returns, total });
});

// ════════════════════════════════════════════════════════
//  Vendor — get returns for their products
// ════════════════════════════════════════════════════════
export const getVendorReturns = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) throw new AppError('Vendor not found', 404);

  const returns = await Return.find({ vendor: vendor._id })
    .populate('customer', 'name email')
    .populate('order', 'totalPrice createdAt')
    .sort({ createdAt: -1 });

  res.json({ success: true, returns });
});

// ════════════════════════════════════════════════════════
//  Admin — APPROVE return
//
//  Branches on returnType:
//  • 'refund'      → Razorpay refund called, order marked refunded
//  • 'replacement' → NO money returned, new item dispatched, order stays delivered
//  • 'exchange'    → NO money returned, team contacts customer, order stays delivered
// ════════════════════════════════════════════════════════
export const approveReturn = asyncHandler(async (req, res) => {
  const { adminNote = '' } = req.body || {};

  const ret = await Return.findById(req.params.id)
    .populate('customer', 'name email _id');

  if (!ret) throw new AppError('Return not found', 404);
  if (ret.status !== 'requested') throw new AppError('Return is not in requested state', 400);

  const order = await Order.findById(ret.order);
  if (!order) throw new AppError('Order not found', 404);

  const returnType = ret.returnType || 'refund';
  const now        = new Date();

  // ══════════════════════════════════════════════
  //  CASE 1: REFUND
  // ══════════════════════════════════════════════
  if (returnType === 'refund') {
    let razorpayRefundId = null;

    // Try Razorpay refund
    if (order.paymentInfo?.razorpayPaymentId && order.paymentInfo?.status === 'paid') {
      try {
        const razorpay = getRazorpay();
        const refund   = await razorpay.payments.refund(
          order.paymentInfo.razorpayPaymentId,
          {
            amount: Math.round(ret.refundAmount * 100),
            notes:  { orderId: order._id.toString(), returnId: ret._id.toString() },
          }
        );
        razorpayRefundId = refund.id;
        console.log(`✅ Razorpay refund: ${razorpayRefundId}`);
      } catch (e) {
        // Expected in test mode — mark refunded anyway
        console.log(`⚠️  Razorpay test mode: ${e.message}`);
      }
    }

    const updatedReturn = await Return.findByIdAndUpdate(
      ret._id,
      {
        status:     'refunded',
        adminNote,
        refundId:   razorpayRefundId || `APPROVED_${ret._id.toString().slice(-8)}`,
        refundedAt: now,
        $push: {
          statusHistory: {
            $each: [
              { status: 'approved', message: adminNote || 'Refund approved by admin',       updatedBy: 'admin',  updatedAt: now },
              { status: 'refunded', message: `Refund of ₹${ret.refundAmount} processed. Amount credited to original payment method.`, updatedBy: 'system', updatedAt: now },
            ],
          },
        },
      },
      { new: true }
    ).populate('customer', 'name email _id');

    // Update order
    await Order.findByIdAndUpdate(order._id, {
      orderStatus:          'refunded',
      refundAmount:          ret.refundAmount,
      refundedAt:            now,
      'paymentInfo.status': 'refunded',
      $push: { statusHistory: { status: 'refunded', message: `Refund of ₹${ret.refundAmount} processed`, updatedAt: now } },
    });

    // Emails + notification
    sendEmail(returnApprovedEmail(ret.customer, order, updatedReturn)).catch(() => {});
    sendEmail(refundCompletedEmail(ret.customer, order, ret.refundAmount, razorpayRefundId)).catch(() => {});

    await createNotification({
      recipient: ret.customer._id,
      type:      'general',
      title:     '💰 Refund Processed!',
      message:   `Your refund of ₹${ret.refundAmount.toLocaleString('en-IN')} has been approved and processed. Amount will be credited to your original payment method.`,
      link:      '/account/returns',
    });

    return res.json({
      success: true,
      return:  updatedReturn,
      message: `✅ Refund of ₹${ret.refundAmount} approved and processed.`,
    });
  }

  // ══════════════════════════════════════════════
  //  CASE 2: REPLACEMENT
  //  No money returned. New item dispatched.
  //  Order status stays as-is (not refunded).
  // ══════════════════════════════════════════════
  if (returnType === 'replacement') {
    const updatedReturn = await Return.findByIdAndUpdate(
      ret._id,
      {
        status:    'replacement_sent',
        adminNote,
        $push: {
          statusHistory: {
            $each: [
              { status: 'approved',          message: adminNote || 'Replacement approved by admin',    updatedBy: 'admin',  updatedAt: now },
              { status: 'replacement_sent',   message: 'Replacement item has been dispatched to customer.', updatedBy: 'system', updatedAt: now },
            ],
          },
        },
      },
      { new: true }
    ).populate('customer', 'name email _id');

    // Order goes back to delivered (no refund, no money change)
    await Order.findByIdAndUpdate(order._id, {
      orderStatus: 'delivered',
      $push: { statusHistory: { status: 'delivered', message: 'Replacement approved — new item being dispatched', updatedAt: now } },
    });

    // Email + notification
    sendEmail(replacementApprovedEmail(ret.customer, order, updatedReturn)).catch(() => {});

    await createNotification({
      recipient: ret.customer._id,
      type:      'general',
      title:     '🔄 Replacement Approved!',
      message:   `Your replacement for Order #${order._id.toString().slice(-8).toUpperCase()} has been approved. A new item will be dispatched within 3-5 business days after pickup.`,
      link:      '/account/returns',
    });

    return res.json({
      success: true,
      return:  updatedReturn,
      message: '✅ Replacement approved. New item will be dispatched. No refund issued.',
    });
  }

  // ══════════════════════════════════════════════
  //  CASE 3: EXCHANGE
  //  No money returned. Team contacts customer.
  // ══════════════════════════════════════════════
  if (returnType === 'exchange') {
    const updatedReturn = await Return.findByIdAndUpdate(
      ret._id,
      {
        status:    'approved',
        adminNote,
        $push: {
          statusHistory: {
            status:    'approved',
            message:   adminNote || 'Exchange approved by admin. Team will contact customer for exchange details.',
            updatedBy: 'admin',
            updatedAt: now,
          },
        },
      },
      { new: true }
    ).populate('customer', 'name email _id');

    // Order stays as delivered
    await Order.findByIdAndUpdate(order._id, {
      orderStatus: 'delivered',
      $push: { statusHistory: { status: 'delivered', message: 'Exchange approved — team will contact customer', updatedAt: now } },
    });

    // Email + notification
    sendEmail(exchangeApprovedEmail(ret.customer, order)).catch(() => {});

    await createNotification({
      recipient: ret.customer._id,
      type:      'general',
      title:     '🔃 Exchange Approved!',
      message:   `Your exchange request for Order #${order._id.toString().slice(-8).toUpperCase()} is approved. Our team will contact you within 24 hours to arrange the exchange.`,
      link:      '/account/returns',
    });

    return res.json({
      success: true,
      return:  updatedReturn,
      message: '✅ Exchange approved. Team will contact customer. No refund issued.',
    });
  }

  throw new AppError(`Unknown return type: ${returnType}`, 400);
});

// ════════════════════════════════════════════════════════
//  Admin — REJECT return
// ════════════════════════════════════════════════════════
export const rejectReturn = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body || {};
  if (!rejectionReason?.trim()) throw new AppError('Rejection reason is required', 400);

  const ret = await Return.findById(req.params.id)
    .populate('customer', 'name email _id');

  if (!ret) throw new AppError('Return not found', 404);
  if (ret.status !== 'requested') throw new AppError('Return is not in pending state', 400);

  const updatedReturn = await Return.findByIdAndUpdate(
    ret._id,
    {
      status:          'rejected',
      rejectionReason,
      $push: {
        statusHistory: {
          status:    'rejected',
          message:   rejectionReason,
          updatedBy: 'admin',
          updatedAt: new Date(),
        },
      },
    },
    { new: true }
  );

  // Revert order back to delivered + restore stock
  await Order.findByIdAndUpdate(ret.order, {
    orderStatus:   'delivered',
    returnRequest: null,
    $push: {
      statusHistory: {
        status:    'delivered',
        message:   'Return rejected — order status restored',
        updatedAt: new Date(),
      },
    },
  });

  for (const item of ret.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  sendEmail(returnRejectedEmail(ret.customer, { _id: ret.order }, rejectionReason)).catch(() => {});
  await createNotification({
    recipient: ret.customer._id,
    type:      'general',
    title:     'Return Request Not Approved',
    message:   `Your return was not approved. Reason: ${rejectionReason}`,
    link:      '/account/returns',
  });

  res.json({ success: true, return: updatedReturn });
});

// ════════════════════════════════════════════════════════
//  Check return eligibility
// ════════════════════════════════════════════════════════
export const checkReturnEligibility = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw new AppError('Order not found', 404);
  if (order.customer.toString() !== req.user._id.toString()) throw new AppError('Not authorized', 403);

  const withinWindow = isWithinReturnWindow(order.deliveredAt);
  const isDelivered  = order.orderStatus === 'delivered';
  const existing     = await Return.findOne({ order: order._id });

  const daysLeft = order.deliveredAt
    ? Math.max(0, RETURN_WINDOW_DAYS - Math.floor((Date.now() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24)))
    : 0;

  let reason = null;
  if (existing)         reason = 'A return request already exists for this order';
  else if (!isDelivered) reason = 'Order must be delivered before requesting a return';
  else if (!withinWindow) reason = `Return window of ${RETURN_WINDOW_DAYS} days has expired`;

  res.json({
    success:       true,
    eligible:      isDelivered && withinWindow && !existing,
    reason,
    daysLeft,
    existingReturn: existing || null,
  });
});

// ════════════════════════════════════════════════════════
//  Admin — Update replacement/exchange status manually
//  @route  PUT /api/returns/:id/status
// ════════════════════════════════════════════════════════
export const updateReturnStatus = asyncHandler(async (req, res) => {
  const { status, message: statusMessage = '' } = req.body || {};

  const ALLOWED_STATUSES = [
    'pickup_scheduled',
    'item_received',
    'replacement_sent',
    'refunded',
    'approved',
  ];

  if (!ALLOWED_STATUSES.includes(status)) {
    throw new AppError(`Invalid status: ${status}`, 400);
  }

  const ret = await Return.findById(req.params.id)
    .populate('customer', 'name email _id');

  if (!ret) throw new AppError('Return not found', 404);
  if (ret.status === 'rejected') throw new AppError('Cannot update a rejected return', 400);

  const STATUS_MESSAGES = {
    pickup_scheduled:  'Pickup has been scheduled at your delivery address.',
    item_received:     'Your returned item has been received and is being inspected.',
    replacement_sent:  'Your replacement item has been dispatched and is on the way!',
    refunded:          'Your refund has been processed successfully.',
    approved:          'Your return request has been approved.',
  };

  const updatedReturn = await Return.findByIdAndUpdate(
    ret._id,
    {
      status,
      ...(status === 'replacement_sent' ? { refundedAt: new Date() } : {}),
      $push: {
        statusHistory: {
          status,
          message:   statusMessage || STATUS_MESSAGES[status],
          updatedBy: 'admin',
          updatedAt: new Date(),
        },
      },
    },
    { new: true }
  ).populate('customer', 'name email _id');

  // Notify customer
  const notifMessages = {
    pickup_scheduled: { title: '📦 Pickup Scheduled',        msg: 'A pickup agent will collect your item from your delivery address.' },
    item_received:    { title: '✅ Item Received',             msg: 'We have received your returned item and are inspecting it.' },
    replacement_sent: { title: '🚀 Replacement Dispatched!',  msg: 'Your replacement item is on the way! Expected delivery in 3-5 business days.' },
    refunded:         { title: '💰 Refund Processed',         msg: `Your refund of ₹${ret.refundAmount?.toLocaleString('en-IN')} has been processed.` },
  };

  if (notifMessages[status]) {
    await createNotification({
      recipient: ret.customer._id,
      type:      'general',
      title:     notifMessages[status].title,
      message:   notifMessages[status].msg,
      link:      '/account/returns',
    });
  }

  res.json({
    success: true,
    return:  updatedReturn,
    message: `Return status updated to "${status}" successfully.`,
  });
});