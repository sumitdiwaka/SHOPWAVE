import express from 'express';
import {
  registerVendor, getVendorProfile, getMyVendorProfile,
  updateVendorProfile, getVendorAnalytics, getAllVendors,
} from '../controllers/vendorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes — specific paths MUST come before /:id
router.get('/', getAllVendors);

// Protected routes — must come before /:id to avoid conflict
router.use(protect);
router.post('/register', registerVendor);
router.get('/me/profile', authorize('vendor', 'admin'), getMyVendorProfile);
router.put('/me/profile', authorize('vendor', 'admin'), updateVendorProfile);
router.get('/me/analytics', authorize('vendor', 'admin'), getVendorAnalytics);

// Dynamic route LAST — otherwise it swallows /register, /me etc.
router.get('/:id', getVendorProfile);

export default router;