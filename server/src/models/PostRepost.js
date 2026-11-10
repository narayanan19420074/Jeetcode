import mongoose from 'mongoose';

// One repost per (user, post). `CommunityPost.repostCount` is kept in sync by the repost service.
const postRepostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', required: true },
  },
  { timestamps: true }
);

postRepostSchema.index({ user: 1, post: 1 }, { unique: true });
postRepostSchema.index({ post: 1 });

export const PostRepost = mongoose.model('PostRepost', postRepostSchema);
