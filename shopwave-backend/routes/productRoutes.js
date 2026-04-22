import express from 'express';
import {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, getFeaturedProducts, getCategories,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

router.use(protect);
router.post('/', authorize('vendor', 'admin'), createProduct);
router.put('/:id', authorize('vendor', 'admin'), updateProduct);
router.delete('/:id', authorize('vendor', 'admin'), deleteProduct);

export default router;
