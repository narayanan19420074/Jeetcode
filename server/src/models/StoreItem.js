import mongoose from 'mongoose';

// Mutable half of a store item. The static half (name, description, course
// syllabus, variants) lives in config/store.js; this row only holds what an
// admin may change without a deploy. Created on first request, never overwritten.
const storeItemSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: null, min: 0 }, // null = unlimited
    active: { type: Boolean, default: true },
    sold: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const StoreItem = mongoose.model('StoreItem', storeItemSchema);
