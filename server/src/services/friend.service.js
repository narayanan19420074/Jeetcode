import { Friendship } from '../models/Friendship.js';

export const MAX_FRIENDS = 200;
export const MAX_PENDING_OUT = 50;

export const pairKey = (a, b) => [String(a), String(b)].sort().join(':');

// Single source of truth for "who are my friends" — the dashboard Friends tab, the
// leaderboard's Friends filter and the friends card all read through this.
export async function getFriendIds(userId) {
  const rows = await Friendship.find({ status: 'accepted', $or: [{ requester: userId }, { recipient: userId }] })
    .select('requester recipient')
    .lean();
  return rows.map((r) => (String(r.requester) === String(userId) ? String(r.recipient) : String(r.requester)));
}

export const countFriends = (userId) =>
  Friendship.countDocuments({ status: 'accepted', $or: [{ requester: userId }, { recipient: userId }] });
