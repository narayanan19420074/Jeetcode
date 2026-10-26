import mongoose from 'mongoose';

const { Schema } = mongoose;

// One row per checkout attempt. Price + plan are fixed on the SERVER when the
// row is created, so the browser can never choose its own amount. The webhook
// flips `status` created -> paid exactly once (atomic update), which makes
// Pro activation idempotent even if YouPI retries the same webhook.
const paymentOrderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: String, enum: ['monthly', 'yearly'], required: true },
    amountPaise: { type: Number, required: true },
    status: { type: String, enum: ['created', 'paid', 'failed', 'expired', 'cancelled'], default: 'created' },
    checkoutUrl: { type: String, default: null },
    gatewayPaymentId: { type: String, default: null },
    utr: { type: String, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const PaymentOrder = mongoose.model('PaymentOrder', paymentOrderSchema);
