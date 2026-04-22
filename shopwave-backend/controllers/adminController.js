import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { sendEmail, vendorApprovedEmail, vendorRejectedEmail } from '../utils/sendEmail.js';
import { createNotification } from './notificationController.js';

// @desc   Admin dashboard stats
export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [totalUsers, totalVendors, totalProducts, totalOrders] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Vendor.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
  ]);

  const revenueData = await Order.aggregate([
    { $match: { orderStatus: 'delivered' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  const recentOrders = await Order.find()
    .populate('customer', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

  const monthlySales = await Order.aggregate([
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);

  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers, totalVendors, totalProducts, totalOrders,
      totalRevenue: revenueData[0]?.total || 0,
      recentOrders,
      monthlySales: monthlySales.reverse(),
      ordersByStatus,
    },
  });
});

// @desc   Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const query = role ? { role } : {};
  const users = await User.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  const total = await User.countDocuments(query);
  res.json({ success: true, users, total });
});

// @desc   Toggle user active status
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'admin') throw new AppError('Cannot modify admin account', 403);
  user.isActive = !user.isActive;
  await user.save({ validateModifiedOnly: true });
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
});

// @desc   Get pending vendor approvals
export const getPendingVendors = asyncHandler(async (_req, res) => {
  const vendors = await Vendor.find({ isApproved: false })
    .populate('user', 'name email createdAt')
    .sort({ createdAt: -1 });
  res.json({ success: true, vendors });
});

// @desc   Approve or reject vendor — sends email + in-app notification
export const approveVendor = asyncHandler(async (req, res) => {
  const { approved, reason = '' } = req.body;
  const vendor = await Vendor.findById(req.params.id).populate('user');
  if (!vendor) throw new AppError('Vendor not found', 404);

  vendor.isApproved = approved;
  if (!approved) vendor.isActive = false;
  await vendor.save();

  const vendorUser = vendor.user;

  if (approved) {
    // ── Approval email ──
    try { await sendEmail(vendorApprovedEmail(vendorUser, vendor)); }
    catch (e) { console.error('Vendor approved email failed:', e.message); }

    // ── Approval in-app notification ──
    await createNotification({
      recipient: vendorUser._id,
      type: 'vendor_approved',
      title: '🎉 Vendor Application Approved!',
      message: `Congratulations! Your shop "${vendor.shopName}" has been approved. You can now start listing products and selling on ShopWave.`,
      link: '/vendor/dashboard',
    });
  } else {
    // ── Rejection email ──
    try { await sendEmail(vendorRejectedEmail(vendorUser, vendor, reason)); }
    catch (e) { console.error('Vendor rejected email failed:', e.message); }

    // ── Rejection in-app notification ──
    await createNotification({
      recipient: vendorUser._id,
      type: 'vendor_rejected',
      title: 'Vendor Application Not Approved',
      message: `Your vendor application for "${vendor.shopName}" was not approved.${reason ? ` Reason: ${reason}` : ''} You can reapply after making improvements.`,
      link: '/vendor/register',
    });
  }

  res.json({
    success: true,
    message: `Vendor ${approved ? 'approved' : 'rejected'} successfully`,
    vendor,
  });
});

// @desc   Admin get all orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { orderStatus: status } : {};
  const orders = await Order.find(query)
    .populate('customer', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Order.countDocuments(query);
  res.json({ success: true, orders, total });
});

// @desc   Feature / unfeature a product
export const toggleFeaturedProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  product.isFeatured = !product.isFeatured;
  await product.save();
  res.json({ success: true, message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'}` });
});