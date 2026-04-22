import express from 'express';
import { createReview, getProductReviews, markHelpful, deleteReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.use(protect);
router.post('/', createReview);
router.put('/:id/helpful', markHelpful);
router.delete('/:id', deleteReview);

export default router;
