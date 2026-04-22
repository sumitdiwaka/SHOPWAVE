import express from 'express';
import { createRazorpayOrder, verifyPayment, getRazorpayKey } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/key', getRazorpayKey);
router.use(protect);
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);

export default router;
