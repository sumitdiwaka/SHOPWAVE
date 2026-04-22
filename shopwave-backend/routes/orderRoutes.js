import express from 'express';
import {
  createOrder, getMyOrders, getOrder,
  updateOrderStatus, cancelOrder, getVendorOrders,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/vendor-orders', authorize('vendor', 'admin'), getVendorOrders);
router.get('/:id', getOrder);
router.put('/:id/status', authorize('vendor', 'admin'), updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

export default router;
