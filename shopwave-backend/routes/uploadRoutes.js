import express from 'express';
import { uploadImage, uploadImages, deleteImage } from '../controllers/uploadController.js';
import { upload } from '../config/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/image', upload.single('image'), uploadImage);
router.post('/images', upload.array('images', 5), uploadImages);
router.delete('/image', deleteImage);

export default router;
