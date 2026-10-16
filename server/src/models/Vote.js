import mongoose from 'mongoose';

// One row per (user, target). `value` is +1 / -1. The running total lives on
// the target document as `score` (kept in sync by community.service.applyVote),
// so list queries can sort by score without aggregating votes every time.
const voteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['solution', 'thread', 'comment'], required: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true },
    value: { type: Number, required: true, validate: (v) => v === 1 || v === -1 },
  },
  { timestamps: true }
);

voteSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });
voteSchema.index({ targetType: 1, target: 1 });

export const Vote = mongoose.model('Vote', voteSchema);
