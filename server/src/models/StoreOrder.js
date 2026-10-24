import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, maxlength: 80 },
    phone: { type: String, trim: true, maxlength: 15 },
    line1: { type: String, trim: true, maxlength: 140 },
    line2: { type: String, trim: true, maxlength: 140, default: '' },
    city: { type: String, trim: true, maxlength: 60 },
    state: { type: String, trim: true, maxlength: 60 },
    pincode: { type: String, trim: true, maxlength: 6 },
    country: { type: String, default: 'India' },
  },
  { _id: false }
);

const storeOrderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, required: true, unique: true, index: true }, // JC-XXXXXXXX
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itemSlug: { type: String, required: true, index: true },
    itemName: { type: String, required: true },
    category: { type: String, enum: ['premium', 'courses', 'merch'], required: true },
    kind: { type: String, enum: ['pro', 'course', 'physical'], required: true },
    unitPrice: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1, default: 1 },
    total: { type: Number, required: true },
    variant: {
      size: { type: String, default: '' },
      color: { type: String, default: '' },
    },
    address: { type: addressSchema, default: null },
    status: {
      type: String,
      enum: ['placed', 'processing', 'shipped', 'delivered', 'fulfilled', 'cancelled'],
      required: true,
      index: true,
    },
    tracking: {
      carrier: { type: String, default: '' },
      number: { type: String, default: '' },
      url: { type: String, default: '' },
    },
    // Pro orders: the date Pro runs until after this purchase.
    proUntil: { type: Date, default: null },
    cancelReason: { type: String, default: '' },
    history: {
      type: [
        {
          _id: false,
          status: String,
          note: { type: String, default: '' },
          by: { type: String, default: 'system' }, // 'user' | 'admin' | 'system'
          at: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

storeOrderSchema.index({ user: 1, createdAt: -1 });
storeOrderSchema.index({ status: 1, createdAt: -1 });

export const StoreOrder = mongoose.model('StoreOrder', storeOrderSchema);
