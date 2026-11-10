import { Follow } from '../models/Follow.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { toObjectId } from './community.service.js';

async function assertFollowable(followerId, targetUserId) {
  toObjectId(targetUserId, 'User');
  if (String(followerId) === String(targetUserId)) throw ApiError.badRequest("You can't follow yourself");
  if (!(await User.exists({ _id: targetUserId }))) throw ApiError.notFound('User not found');
}

export async function setFollowing(followerId, targetUserId, following) {
  await assertFollowable(followerId, targetUserId);
  const pair = { follower: followerId, following: targetUserId };
  if (following) await Follow.updateOne(pair, { $setOnInsert: pair }, { upsert: true });
  else await Follow.deleteOne(pair);
  return { isFollowing: following };
}

export async function findFollowedUserIds(followerId, userIds) {
  const rows = await Follow.find({ follower: followerId, following: { $in: userIds } }).select('following').lean();
  return new Set(rows.map((row) => String(row.following)));
}
