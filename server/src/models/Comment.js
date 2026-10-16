import mongoose from 'mongoose';

// Flat storage, tree rebuilt on the client via `parent`. `depth` is capped
// (see MAX_COMMENT_DEPTH in community.service) so threads stay readable on a
// phone-width pane. Comments that still have replies are soft-deleted
// (body blanked) so the reply chain doesn't vanish.
const commentSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ['solution', 'thread'], required: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    depth: { type: Number, default: 0 },

    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, default: '', maxlength: 3000 },

    score: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

commentSchema.index({ targetType: 1, target: 1, createdAt: 1 });
commentSchema.index({ parent: 1 });

export const Comment = mongoose.model('Comment', commentSchema);
