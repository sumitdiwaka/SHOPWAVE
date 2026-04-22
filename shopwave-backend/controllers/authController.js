import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendEmail, welcomeEmail } from '../utils/sendEmail.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';

// @desc   Register user
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) throw new AppError('Email already registered', 400);

  const allowedRoles = ['customer', 'vendor'];
  const assignedRole = allowedRoles.includes(role) ? role : 'customer';
  const user = await User.create({ name, email, password, role: assignedRole });

  try { await sendEmail(welcomeEmail(user)); } catch { /* optional */ }

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, wishlist: [] },
  });
});

// @desc   Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Please provide email and password', 400);

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw new AppError('Invalid credentials', 401);
  if (!user.isActive) throw new AppError('Account deactivated. Contact support.', 403);

  // fetch wishlist count for navbar badge
  const fullUser = await User.findById(user._id);

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      wishlist: fullUser.wishlist || [],
    },
  });
});

// @desc   Get current user profile — populate wishlist with category for filtering
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'name price discountPrice images category rating numReviews stock');
  res.json({ success: true, user });
});

// @desc   Update profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, ...(avatar && { avatar }) },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user });
});

// @desc   Update password
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) throw new AppError('Current password is wrong', 401);
  user.password = newPassword;
  await user.save();
  res.json({ success: true, token: generateToken(user._id), message: 'Password updated successfully' });
});

// @desc   Add address
export const addAddress = asyncHandler(async (req, res) => {
  const { label, street, city, state, pincode, isDefault } = req.body;
  const user = await User.findById(req.user._id);
  if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push({ label, street, city, state, pincode, isDefault: isDefault || false });
  await user.save({ validateModifiedOnly: true });
  res.json({ success: true, addresses: user.addresses });
});

// @desc   Toggle wishlist — returns updated wishlist IDs array for Redux
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);

  const idx = user.wishlist.findIndex((id) => id.toString() === productId);

  let inWishlist;
  if (idx === -1) {
    user.wishlist.push(productId);
    inWishlist = true;
  } else {
    user.wishlist.splice(idx, 1);
    inWishlist = false;
  }

  await user.save({ validateModifiedOnly: true });

  res.json({
    success: true,
    message: inWishlist ? 'Added to wishlist' : 'Removed from wishlist',
    inWishlist,
    wishlist: user.wishlist, // ← full array returned so Redux can update count
    wishlistCount: user.wishlist.length,
  });
});

// @desc   Forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new AppError('No user with that email', 404);

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save({ validateModifiedOnly: true });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset — ShopWave',
    html: `<p>Reset your password: <a href="${resetUrl}">${resetUrl}</a> (valid 15 min)</p>`,
  });

  res.json({ success: true, message: 'Reset link sent to email' });
});

// @desc   Reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) throw new AppError('Invalid or expired reset token', 400);

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, token: generateToken(user._id), message: 'Password reset successful' });
});