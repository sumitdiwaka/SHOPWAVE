import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { sendEmail, newProductEmail, saleProductEmail } from '../utils/sendEmail.js';
import { createNotification } from './notificationController.js';

// @desc   Get all products with search, filter, sort, pagination
export const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, rating, vendor, sort, page = 1, limit = 12 } = req.query;

  const query = { isActive: true };
  if (keyword)   query.$text = { $search: keyword };
  if (category)  query.category = category;
  if (vendor)    query.vendor = vendor;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (rating) query.rating = { $gte: Number(rating) };

  const sortOptions = {
    newest:       { createdAt: -1 },
    'price-asc':  { price: 1 },
    'price-desc': { price: -1 },
    rating:       { rating: -1 },
    popular:      { sold: -1 },
  };

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate('vendor', 'shopName shopLogo rating')
    .sort(sortOptions[sort] || { createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @desc   Get single product
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('vendor', 'shopName shopLogo rating numReviews address isApproved')
    .populate({ path: 'reviews', populate: { path: 'user', select: 'name avatar' }, options: { limit: 10 } });

  if (!product || !product.isActive) throw new AppError('Product not found', 404);
  res.json({ success: true, product });
});

// @desc   Create product (vendor only) — notifies all customers
export const createProduct = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id, isApproved: true })
    .populate('user', 'name email');
  if (!vendor) throw new AppError('Vendor not found or not approved', 403);

  const product = await Product.create({ ...req.body, vendor: vendor._id });
  await product.populate('vendor', 'shopName category');

  // ── Notify all active customers (in-app + email) ──
  // Limit to 100 customers for email to avoid spam; use in-app for all
  const customers = await User.find({ role: 'customer', isActive: true }, '_id name email').limit(200);

  const notifPromises = customers.map((customer) =>
    createNotification({
      recipient: customer._id,
      type: 'new_product',
      title: `New Arrival: ${product.name}`,
      message: `${vendor.shopName} just listed a new product in ${product.category}. Check it out!`,
      link: `/products/${product._id}`,
      meta: { productId: product._id, vendorId: vendor._id },
    })
  );
  await Promise.allSettled(notifPromises);

  // Send email to first 50 customers only (avoid spam on large user base)
  const emailCustomers = customers.slice(0, 50);
  for (const customer of emailCustomers) {
    try {
      await sendEmail(newProductEmail(customer, product, vendor));
    } catch { /* individual email failure should not block */ }
  }

  // ── Notify vendor (confirmation) ──
  await createNotification({
    recipient: req.user._id,
    type: 'general',
    title: 'Product Listed Successfully!',
    message: `Your product "${product.name}" is now live on ShopWave and customers have been notified.`,
    link: `/products/${product._id}`,
  });

  res.status(201).json({ success: true, product });
});

// @desc   Update product — if discount added, send sale notification
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('vendor');
  if (!product) throw new AppError('Product not found', 404);

  const vendor = await Vendor.findOne({ user: req.user._id });
  const isOwner = vendor && vendor._id.toString() === product.vendor._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) throw new AppError('Not authorized to update this product', 403);

  const wasOnSale     = product.discountPrice > 0;
  const willBeOnSale  = Number(req.body.discountPrice) > 0;
  const saleJustAdded = !wasOnSale && willBeOnSale;

  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('vendor', 'shopName category');

  // ── If vendor just added a discount — send sale notification to customers ──
  if (saleJustAdded && updated.discountPrice > 0) {
    const discountPercent = Math.round(((updated.price - updated.discountPrice) / updated.price) * 100);
    const vendorInfo = updated.vendor;

    const customers = await User.find({ role: 'customer', isActive: true }, '_id name email').limit(200);

    const notifPromises = customers.map((customer) =>
      createNotification({
        recipient: customer._id,
        type: 'product_sale',
        title: `🔥 ${discountPercent}% OFF Sale!`,
        message: `${vendorInfo.shopName} is offering ${discountPercent}% off on "${updated.name}". Limited stock!`,
        link: `/products/${updated._id}`,
        meta: { productId: updated._id, discountPercent },
      })
    );
    await Promise.allSettled(notifPromises);

    // Email first 50 customers
    const emailCustomers = customers.slice(0, 50);
    for (const customer of emailCustomers) {
      try {
        await sendEmail(saleProductEmail(customer, updated, vendorInfo, discountPercent));
      } catch { /* continue */ }
    }

    // Notify vendor
    await createNotification({
      recipient: req.user._id,
      type: 'general',
      title: 'Sale Notification Sent!',
      message: `Customers have been notified about the ${discountPercent}% sale on "${updated.name}".`,
      link: `/vendor/products`,
    });
  }

  res.json({ success: true, product: updated });
});

// @desc   Delete product (soft delete)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('vendor');
  if (!product) throw new AppError('Product not found', 404);

  const vendor = await Vendor.findOne({ user: req.user._id });
  const isOwner = vendor && vendor._id.toString() === product.vendor._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw new AppError('Not authorized', 403);

  product.isActive = false;
  await product.save();
  res.json({ success: true, message: 'Product removed' });
});

// @desc   Get featured products
export const getFeaturedProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate('vendor', 'shopName')
    .limit(8);
  res.json({ success: true, products });
});

// @desc   Get product categories
export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Product.distinct('category', { isActive: true });
  res.json({ success: true, categories });
});