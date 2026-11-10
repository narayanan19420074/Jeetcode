import mongoose from 'mongoose';

// Global community feed post (not tied to a problem). `isAnonymous` hides the author in every API response;
// the author id is still stored so the owner can delete the post and moderators can act on reports.
const communityPostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isAnonymous: { type: Boolean, default: false },
    category: { type: String, enum: ['general', 'career', 'interview', 'contest', 'compensation'], default: 'general' },

    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
    body: { type: String, required: true, maxlength: 10000 },
    excerpt: { type: String, default: '', maxlength: 200 },
    // Id of the first image in the post; the feed shows it as the post picture.
    coverImage: { type: String, default: '' },

    score: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

communityPostSchema.index({ category: 1, createdAt: -1 });
communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ score: -1, createdAt: -1 });

export const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
