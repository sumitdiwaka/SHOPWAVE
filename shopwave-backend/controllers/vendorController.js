import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { sendEmail, vendorApplicationEmail, adminNewVendorEmail } from '../utils/sendEmail.js';
import { createNotification } from './notificationController.js';

// @desc   Register as vendor
export const registerVendor = asyncHandler(async (req, res) => {
  const exists = await Vendor.findOne({ user: req.user._id });
  if (exists) throw new AppError('Vendor profile already exists', 400);

  const vendor = await Vendor.create({ user: req.user._id, ...req.body });
  await User.findByIdAndUpdate(req.user._id, { role: 'vendor' });

  // ── 1. Email → vendor: "Application received" ──
  await sendEmail(vendorApplicationEmail(req.user, vendor));

  // ── 2. Email → ALL admins: "New vendor application - action required" ──
  const admins = await User.find({ role: 'admin' }, '_id name email');
  for (const admin of admins) {
    await sendEmail(adminNewVendorEmail(admin.email, req.user, vendor));
  }

  // ── 3. In-app notification → vendor ──
  await createNotification({
    recipient: req.user._id,
    type: 'vendor_application',
    title: '✅ Application Submitted!',
    message: `Your vendor application for "${vendor.shopName}" has been received. You'll be notified once reviewed (usually within 24 hours).`,
    link: '/vendor/dashboard',
  });

  // ── 4. In-app notification → all admins ──
  for (const admin of admins) {
    await createNotification({
      recipient: admin._id,
      type: 'vendor_application',
      title: '🔔 New Vendor Application',
      message: `${req.user.name} applied to open "${vendor.shopName}" (${vendor.category}). Review and approve from the admin panel.`,
      link: '/admin/vendors',
      meta: { vendorId: vendor._id },
    });
  }

  res.status(201).json({ success: true, vendor });
});

// @desc   Get vendor profile (public)
export const getVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id).populate('user', 'name email avatar');
  if (!vendor) throw new AppError('Vendor not found', 404);
  const products = await Product.find({ vendor: vendor._id, isActive: true }).limit(12);
  res.json({ success: true, vendor, products });
});

// @desc   Get my vendor profile
export const getMyVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) throw new AppError('Vendor profile not found', 404);
  res.json({ success: true, vendor });
});

// @desc   Update vendor profile
export const updateVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!vendor) throw new AppError('Vendor not found', 404);
  res.json({ success: true, vendor });
});

// @desc   Vendor analytics
export const getVendorAnalytics = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) throw new AppError('Vendor not found', 404);

  const totalProducts   = await Product.countDocuments({ vendor: vendor._id, isActive: true });
  const totalOrders     = await Order.countDocuments({ 'items.vendor': vendor._id });
  const deliveredOrders = await Order.countDocuments({ 'items.vendor': vendor._id, orderStatus: 'delivered' });

  const revenueData = await Order.aggregate([
    { $match: { 'items.vendor': vendor._id, orderStatus: 'delivered' } },
    { $unwind: '$items' },
    { $match: { 'items.vendor': vendor._id } },
    { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlySales = await Order.aggregate([
    { $match: { 'items.vendor': vendor._id, createdAt: { $gte: sixMonthsAgo } } },
    { $unwind: '$items' },
    { $match: { 'items.vendor': vendor._id } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const topProducts = await Product.find({ vendor: vendor._id, isActive: true })
    .sort({ sold: -1 })
    .limit(5)
    .select('name sold price images');

  res.json({
    success: true,
    analytics: {
      totalProducts, totalOrders, deliveredOrders,
      totalRevenue: revenueData[0]?.total || 0,
      monthlySales, topProducts,
    },
  });
});

// @desc   Get all vendors (public)
export const getAllVendors = asyncHandler(async (_req, res) => {
  const vendors = await Vendor.find({ isApproved: true, isActive: true })
    .populate('user', 'name')
    .select('shopName shopLogo shopDescription category rating numReviews totalSales');
  res.json({ success: true, vendors });
});