import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema(
  {
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
    body: { type: String, required: true, maxlength: 10000 }, // markdown
    excerpt: { type: String, default: '', maxlength: 200 },

    score: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: Date.now },
    editedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

threadSchema.index({ problem: 1, lastActivityAt: -1 });
threadSchema.index({ problem: 1, score: -1, createdAt: -1 });
threadSchema.index({ problem: 1, createdAt: -1 });

export const Thread = mongoose.model('Thread', threadSchema);
