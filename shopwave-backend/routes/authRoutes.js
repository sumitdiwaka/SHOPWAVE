import express from 'express';
import {
  register, login, getProfile, updateProfile,
  updatePassword, addAddress, toggleWishlist,
  forgotPassword, resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.use(protect); // All routes below require auth
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/update-password', updatePassword);
router.post('/address', addAddress);
router.post('/wishlist', toggleWishlist);

export default router;
