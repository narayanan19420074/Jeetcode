import mongoose from 'mongoose';

// Stored for moderation. One report per (reporter, target).
const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['solution', 'thread', 'comment'], required: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, enum: ['spam', 'abusive', 'off-topic', 'wrong-solution', 'other'], required: true },
    note: { type: String, default: '', maxlength: 300 },
    status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open', index: true },
  },
  { timestamps: true }
);

reportSchema.index({ reporter: 1, targetType: 1, target: 1 }, { unique: true });

export const Report = mongoose.model('Report', reportSchema);
