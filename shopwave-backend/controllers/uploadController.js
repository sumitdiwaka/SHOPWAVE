import { cloudinary } from '../config/cloudinary.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';

// @desc   Upload single image
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  res.json({
    success: true,
    url: req.file.path,
    public_id: req.file.filename,
  });
});

// @desc   Upload multiple images (max 5)
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  const images = req.files.map((file) => ({
    url: file.path,
    public_id: file.filename,
  }));

  res.json({ success: true, images });
});

// @desc   Delete image from Cloudinary
export const deleteImage = asyncHandler(async (req, res) => {
  const { public_id } = req.body;
  if (!public_id) throw new AppError('public_id is required', 400);

  const result = await cloudinary.uploader.destroy(public_id);
  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new AppError('Failed to delete image from Cloudinary', 500);
  }

  res.json({ success: true, message: 'Image deleted successfully' });
});