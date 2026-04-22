import express from 'express';
import {
  getDashboardStats, getAllUsers, toggleUserStatus,
  getPendingVendors, approveVendor, getAllOrders, toggleFeaturedProduct,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/vendors/pending', getPendingVendors);
router.put('/vendors/:id/approve', approveVendor);
router.get('/orders', getAllOrders);
router.put('/products/:id/feature', toggleFeaturedProduct);

export default router;
