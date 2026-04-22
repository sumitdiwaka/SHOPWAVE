import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    shopName: { type: String, required: [true, 'Shop name is required'], trim: true },
    shopDescription: { type: String, default: '' },
    shopLogo: { type: String, default: '' },
    shopBanner: { type: String, default: '' },
    category: { type: String, required: true },
    gstNumber: { type: String, default: '' },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Vendor', vendorSchema);
