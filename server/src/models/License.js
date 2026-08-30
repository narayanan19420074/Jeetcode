import mongoose from 'mongoose';

const { Schema } = mongoose;

const licenseSchema = new Schema(
  {
    // The redeemable key itself, e.g. "JEET-XXXX-XXXX-XXXX". Stored
    // uppercase + unique so lookups are case-insensitive without a
    // separate normalized field.
    key: { type: String, required: true, unique: true, uppercase: true, trim: true },

    isUsed: { type: Boolean, default: false },
    usedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    activatedAt: { type: Date, default: null },

    // null = lifetime license (no expiry). If set, User.proExpiresAt gets
    // this value on activation — same field the Razorpay flow writes to,
    // so checkProAccess doesn't need to know or care which path granted
    // Pro access.
    expiresAt: { type: Date, default: null },

    // Free-text note for admin bookkeeping (e.g. "batch for Trichy
    // college outreach, Aug 2026") — never shown to the redeeming user.
    note: { type: String, default: null },
  },
  { timestamps: true }
);

licenseSchema.index({ key: 1 });

export const License = mongoose.model('License', licenseSchema);
