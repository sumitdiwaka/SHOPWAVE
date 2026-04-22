import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        vendor:   { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor',  required: true },
        name:     String,
        image:    String,
        price:    Number,
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    shippingAddress: {
      street:  { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      pincode: { type: String, required: true },
    },
    paymentInfo: {
      razorpayOrderId:  String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      method: { type: String, enum: ['razorpay', 'cod'], default: 'razorpay' },
      status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
      paidAt: Date,
    },
    itemsPrice:    { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    taxPrice:      { type: Number, default: 0 },
    totalPrice:    { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ['placed','confirmed','processing','shipped','delivered','cancelled','return_requested','returned','refunded'],
      default: 'placed',
    },
    statusHistory: [
      {
        status:    String,
        message:   String,
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    deliveredAt:       Date,
    cancelledAt:       Date,
    cancellationReason: String,

    // ── Return fields ──────────────────────────────
    returnRequest:   { type: mongoose.Schema.Types.ObjectId, ref: 'Return' },
    isReturnEligible: { type: Boolean, default: true }, // false after 7 days
    refundedAt:      Date,
    refundAmount:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);