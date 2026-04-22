import Razorpay from 'razorpay';
import crypto   from 'crypto';
import Order    from '../models/Order.js';
import Vendor   from '../models/Vendor.js';
import User     from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { createNotification }     from './notificationController.js';
import { sendEmail, vendorNewOrderEmail } from '../utils/sendEmail.js';

const getRazorpay = () => new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Create Razorpay order ────────────────────────────────
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const razorpay = getRazorpay();
  const { amount, orderId } = req.body;

  if (!orderId) throw new AppError('orderId is required', 400);

  // Verify the ShopWave order exists before creating Razorpay order
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found — please try placing your order again', 404);

  const razorpayOrder = await razorpay.orders.create({
    amount:   Math.round(amount * 100),
    currency: 'INR',
    receipt:  `sw_${orderId.slice(-8)}`,
    notes:    { shopwaveOrderId: orderId },
  });

  res.json({
    success:         true,
    razorpayOrderId: razorpayOrder.id,
    amount:          razorpayOrder.amount,
    currency:        razorpayOrder.currency,
    keyId:           process.env.RAZORPAY_KEY_ID,
  });
});

// ── Verify payment + update order + notify vendor ────────
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  if (!orderId) throw new AppError('orderId is required', 400);

  // 1. Verify Razorpay signature
  const body              = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw new AppError('Payment signature verification failed', 400);
  }

  // 2. Fetch order
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  // 3. ── KEY FIX: use findByIdAndUpdate — avoids model.save() validation issues ──
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      orderStatus: 'confirmed',
      'paymentInfo.razorpayOrderId':  razorpayOrderId,
      'paymentInfo.razorpayPaymentId': razorpayPaymentId,
      'paymentInfo.razorpaySignature': razorpaySignature,
      'paymentInfo.method': 'razorpay',
      'paymentInfo.status': 'paid',
      'paymentInfo.paidAt': new Date(),
      $push: { statusHistory: { status: 'confirmed', message: 'Payment received — order confirmed', updatedAt: new Date() } },
    },
    { new: true }
  ).populate('customer', 'name email _id');

  if (!updatedOrder) throw new AppError('Failed to update order', 500);

  // 4. Real-time socket events
  req.io?.to(orderId).emit('paymentSuccess', { orderId, status: 'confirmed' });
  req.io?.to(`user_${updatedOrder.customer._id.toString()}`).emit('paymentSuccess', { orderId });

  // 5. Customer in-app notification
  await createNotification({
    recipient: updatedOrder.customer._id,
    type:      'order_status',
    title:     '💳 Payment Confirmed!',
    message:   `₹${updatedOrder.totalPrice.toLocaleString('en-IN')} received for Order #${orderId.slice(-8).toUpperCase()}. Your order is confirmed!`,
    link:      `/account/orders/${orderId}`,
  });

  // 6. Notify each vendor
  const vendorIds = [...new Set(updatedOrder.items.map((i) => i.vendor?.toString()).filter(Boolean))];

  for (const vendorId of vendorIds) {
    try {
      const vendor     = await Vendor.findById(vendorId);
      if (!vendor?.user) continue;
      const vendorUser = await User.findById(vendor.user);
      if (!vendorUser) continue;

      const vendorItems = updatedOrder.items.filter((i) => i.vendor?.toString() === vendorId);

      // In-app notification
      await createNotification({
        recipient: vendor.user,
        type:      'order_placed',
        title:     '💰 New Paid Order!',
        message:   `${updatedOrder.customer.name} paid for ${vendorItems.length} item(s). Order #${orderId.slice(-8).toUpperCase()} is ready to process.`,
        link:      '/vendor/orders',
      });

      // Real-time
      req.io?.to(`user_${vendor.user.toString()}`).emit('newOrder', {
        orderId,
        customerName: updatedOrder.customer.name,
        amount:       vendorItems.reduce((s, i) => s + i.price * i.quantity, 0),
      });

      // Email
      try { await sendEmail(vendorNewOrderEmail(vendorUser, updatedOrder, vendorItems)); }
      catch (e) { console.error('Vendor email error:', e.message); }

    } catch (e) { console.error('Vendor notify error:', e.message); }
  }

  res.json({ success: true, message: 'Payment verified', order: updatedOrder });
});

// ── Get Razorpay key for frontend ───────────────────────
export const getRazorpayKey = asyncHandler(async (_req, res) => {
  res.json({ success: true, keyId: process.env.RAZORPAY_KEY_ID });
});