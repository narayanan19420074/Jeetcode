import mongoose from 'mongoose';

// Append-only coin ledger. One row per balance change; `User.coins` is the
// fast cache of the running total. `key` makes every grant idempotent: the
// same event (e.g. "first solve of problem X") can never pay twice because the
// unique index rejects the second insert.
const coinTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true }, // +earn / -spend
    type: { type: String, enum: ['earn', 'spend', 'refund', 'admin'], required: true },
    reason: { type: String, required: true, maxlength: 40 }, // solve | daily | quest | purchase | refund | admin
    title: { type: String, required: true, maxlength: 140 }, // shown in coin history
    refId: { type: String, default: null }, // problem / order / quest id
    key: { type: String, unique: true, sparse: true },
    balanceAfter: { type: Number, default: null },
  },
  { timestamps: true }
);

coinTransactionSchema.index({ user: 1, createdAt: -1 });

export const CoinTransaction = mongoose.model('CoinTransaction', coinTransactionSchema);
