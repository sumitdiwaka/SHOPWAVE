import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();

// Validate env vars on startup
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('❌ Cloudinary env vars missing! Check your .env file:');
  console.error('   CLOUDINARY_CLOUD_NAME =', CLOUDINARY_CLOUD_NAME || 'MISSING');
  console.error('   CLOUDINARY_API_KEY    =', CLOUDINARY_API_KEY ? 'SET' : 'MISSING');
  console.error('   CLOUDINARY_API_SECRET =', CLOUDINARY_API_SECRET ? 'SET' : 'MISSING');
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// params MUST be a function — not a plain object (multer-storage-cloudinary v4+)
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    return {
      folder: 'shopwave/products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
      public_id: `product_${Date.now()}_${file.originalname.split('.')[0].replace(/\s+/g, '_')}`,
    };
  },
});

// Multer with file size limit (5MB per file)
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WEBP images are allowed'), false);
    }
  },
});

export { cloudinary };