import { PostRepost } from '../models/PostRepost.js';
import { CommunityPost } from '../models/CommunityPost.js';

async function readRepostCount(postId) {
  const fresh = await CommunityPost.findById(postId).select('repostCount').lean();
  return Math.max(fresh?.repostCount ?? 0, 0);
}

// Reposting twice must not count twice: the counter only moves when a repost document was really created or removed.
export async function setPostReposted(userId, post, reposted) {
  if (reposted) {
    const result = await PostRepost.updateOne({ user: userId, post: post._id }, { $setOnInsert: { user: userId, post: post._id } }, { upsert: true });
    if (result.upsertedCount) await CommunityPost.updateOne({ _id: post._id }, { $inc: { repostCount: 1 } });
  } else {
    const result = await PostRepost.deleteOne({ user: userId, post: post._id });
    if (result.deletedCount) await CommunityPost.updateOne({ _id: post._id }, { $inc: { repostCount: -1 } });
  }
  return { isReposted: reposted, repostCount: await readRepostCount(post._id) };
}

export async function findRepostedPostIds(userId, postIds) {
  const rows = await PostRepost.find({ user: userId, post: { $in: postIds } }).select('post').lean();
  return new Set(rows.map((row) => String(row.post)));
}
