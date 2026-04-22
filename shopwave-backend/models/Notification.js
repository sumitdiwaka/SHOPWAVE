import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'vendor_application',   // vendor submitted form
        'vendor_approved',      // admin approved vendor
        'vendor_rejected',      // admin rejected vendor
        'new_product',          // vendor added new product → customers notified
        'product_sale',         // vendor marked product on sale
        'order_placed',         // new order for vendor
        'order_status',         // order status changed for customer
        'general',
      ],
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    link:    { type: String, default: '' },  // frontend URL to navigate to
    isRead:  { type: Boolean, default: false },
    meta:    { type: mongoose.Schema.Types.Mixed, default: {} }, // extra data
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);