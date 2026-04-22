import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema(
  {
    order:    { type: mongoose.Schema.Types.ObjectId, ref: 'Order',  required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    vendor:   { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },

    items: [
      {
        product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name:     String,
        image:    String,
        price:    Number,
        quantity: { type: Number, min: 1 },
      },
    ],

    reason: {
      type: String,
      enum: [
        'defective_damaged',
        'wrong_item_received',
        'not_as_described',
        'missing_parts',
        'size_fit_issue',
        'changed_mind',
        'better_price_elsewhere',
        'arrived_late',
        'other',
      ],
      required: true,
    },

    // ── What the customer wants ──────────────────────────
    // Vendor sets the return policy — customer can choose what they prefer
    returnType: {
      type: String,
      enum: ['refund', 'replacement', 'exchange'],
      default: 'refund',
    },

    reasonText: { type: String, default: '' },
    images:     [String],

    status: {
      type: String,
      enum: [
        'requested',
        'approved',
        'rejected',
        'pickup_scheduled',
        'item_received',
        'refund_initiated',
        'refunded',
        'replacement_sent',
      ],
      default: 'requested',
    },

    statusHistory: [
      {
        status:    String,
        message:   String,
        updatedBy: { type: String, enum: ['customer', 'vendor', 'admin', 'system'] },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    refundAmount:  { type: Number, default: 0 },
    refundMethod: {
      type: String,
      enum: ['original_payment', 'store_credit', 'bank_transfer'],
      default: 'original_payment',
    },
    refundId:   String,
    refundedAt: Date,

    adminNote:       { type: String, default: '' },
    rejectionReason: { type: String, default: '' },

    pickupAddress: {
      street:  String,
      city:    String,
      state:   String,
      pincode: String,
    },
    pickupScheduledAt: Date,
    returnWindowDays:  { type: Number, default: 7 },
  },
  { timestamps: true }
);

returnSchema.index({ customer: 1, createdAt: -1 });
returnSchema.index({ vendor:   1, createdAt: -1 });
returnSchema.index({ status:   1, createdAt: -1 });

export default mongoose.model('Return', returnSchema);