import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';

// @desc   Create review (only verified buyers)
export const createReview = asyncHandler(async (req, res) => {
  const { productId, orderId, rating, title, comment } = req.body;

  // ── Sanitize orderId: strip leading # and whitespace ──
  const cleanOrderId = String(orderId || '').replace(/^#/, '').trim();

  // ── Validate it's a real MongoDB ObjectId (24 hex chars) ──
  if (!cleanOrderId || !mongoose.Types.ObjectId.isValid(cleanOrderId)) {
    throw new AppError(
      `Invalid Order ID "${orderId}". Please copy the full Order ID from My Account → Orders (it is a 24-character code, not the short display code starting with #).`,
      400
    );
  }

  // ── Verify purchase: order must belong to this user, contain this product, and be delivered ──
  const order = await Order.findOne({
    _id: cleanOrderId,
    customer: req.user._id,
    'items.product': productId,
  });

  if (!order) {
    throw new AppError(
      'Order not found. Make sure you copy the full Order ID from your order details page.',
      404
    );
  }

  if (order.orderStatus !== 'delivered') {
    throw new AppError(
      `You can only review after the order is delivered. Current status: "${order.orderStatus}".`,
      403
    );
  }

  // ── Check if already reviewed ──
  const alreadyReviewed = await Review.findOne({ product: productId, user: req.user._id });
  if (alreadyReviewed) throw new AppError('You have already reviewed this product', 400);

  // ── Create review ──
  const review = await Review.create({
    product: productId,
    user: req.user._id,
    order: cleanOrderId,
    rating: Number(rating),
    title: title.trim(),
    comment: comment.trim(),
    isVerifiedPurchase: true,
  });

  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, review });
});

// @desc   Get reviews for a product
export const getProductReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = 'newest' } = req.query;
  const sortOptions = {
    newest:  { createdAt: -1 },
    helpful: { helpful: -1 },
    rating:  { rating: -1 },
  };

  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort(sortOptions[sort] || { createdAt: -1 })
    .skip((page - 1) * Number(limit))
    .limit(Number(limit));

  const total = await Review.countDocuments({ product: req.params.productId });

  const distribution = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(req.params.productId) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.json({ success: true, reviews, total, distribution });
});

// @desc   Mark review as helpful
export const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);

  const idx = review.helpful.indexOf(req.user._id);
  if (idx === -1) review.helpful.push(req.user._id);
  else review.helpful.splice(idx, 1);

  await review.save();
  res.json({ success: true, helpfulCount: review.helpful.length });
});

// @desc   Delete review (owner or admin)
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);

  const isOwner = review.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw new AppError('Not authorized', 403);

  await Review.findByIdAndDelete(req.params.id);
  await Review.calcAverageRating(review.product);

  res.json({ success: true, message: 'Review deleted' });
});