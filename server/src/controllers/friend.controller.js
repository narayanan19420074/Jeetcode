import mongoose from 'mongoose';
import { Friendship } from '../models/Friendship.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getRanking, assignRanks, publicRow } from '../services/leaderboard.service.js';
import { notifyFriendsChanged } from '../realtime/hub.js';
import { MAX_FRIENDS, MAX_PENDING_OUT, pairKey, countFriends } from '../services/friend.service.js';

const USER_FIELDS = 'name handle avatarUrl streakDays lastActivityDate company';
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const otherId = (edge, me) => (String(edge.requester) === String(me) ? String(edge.recipient) : String(edge.requester));

// How `me` relates to someone else, from the (optional) friendship document.
function relationOf(edge, me) {
  if (!edge) return { relation: 'none' };
  if (edge.status === 'accepted') return { relation: 'friends' };
  return String(edge.requester) === String(me)
    ? { relation: 'sent', requestId: String(edge._id) }
    : { relation: 'received', requestId: String(edge._id) };
}

async function assertRoom(userId, who = 'You') {
  if ((await countFriends(userId)) >= MAX_FRIENDS) {
    throw ApiError.badRequest(`${who} reached the ${MAX_FRIENDS}-friend limit`);
  }
}

async function findUserByHandle(handle) {
  const user = await User.findOne({ handle, role: { $ne: 'admin' } }).select(USER_FIELDS).lean();
  if (!user) throw ApiError.notFound('No player with that handle');
  return user;
}

// GET /friends — friends (with their leaderboard stats), requests received, requests sent.
export const listFriends = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const edges = await Friendship.find({ $or: [{ requester: me }, { recipient: me }] })
    .sort({ updatedAt: -1 })
    .limit(500)
    .lean();

  const users = await User.find({ _id: { $in: edges.map((e) => otherId(e, me)) }, role: { $ne: 'admin' } })
    .select(USER_FIELDS)
    .lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));

  // Same all-time ranking the leaderboard uses, so a friend's numbers match everywhere.
  const entry = await getRanking('all');
  const ranked = new Map(assignRanks(entry.rows).map((r) => [r.userId, r]));

  const friends = [];
  const incoming = [];
  const outgoing = [];
  for (const e of edges) {
    const u = byId.get(otherId(e, me));
    if (!u) continue; // deleted / admin account
    if (e.status === 'accepted') {
      const s = ranked.get(String(u._id));
      friends.push({
        ...publicRow(u),
        score: s?.score || 0,
        solved: s?.solved || 0,
        easy: s?.easy || 0,
        medium: s?.medium || 0,
        hard: s?.hard || 0,
        aptitude: s?.aptitude || 0,
        rank: s?.rank ?? null,
        since: e.respondedAt || e.createdAt,
      });
    } else if (String(e.recipient) === String(me)) {
      incoming.push({ requestId: String(e._id), user: publicRow(u), createdAt: e.createdAt });
    } else {
      outgoing.push({ requestId: String(e._id), user: publicRow(u), createdAt: e.createdAt });
    }
  }
  friends.sort((a, b) => b.score - a.score || a.handle.localeCompare(b.handle));

  new ApiResponse(200, {
    friends,
    incoming,
    outgoing,
    counts: { friends: friends.length, incoming: incoming.length, outgoing: outgoing.length },
    maxFriends: MAX_FRIENDS,
  }).send(res);
});

// GET /friends/search?q= — handle prefix search (uses the unique handle index).
export const searchPlayers = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const { q } = req.query;
  const users = await User.find({
    _id: { $ne: me },
    role: { $ne: 'admin' },
    handle: new RegExp(`^${escapeRegex(q)}`),
  })
    .sort({ handle: 1 })
    .limit(8)
    .select(USER_FIELDS)
    .lean();

  const edges = await Friendship.find({ pairKey: { $in: users.map((u) => pairKey(me, u._id)) } }).lean();
  const byKey = new Map(edges.map((e) => [e.pairKey, e]));

  new ApiResponse(
    200,
    users.map((u) => ({ ...publicRow(u), ...relationOf(byKey.get(pairKey(me, u._id)), me) }))
  ).send(res);
});

// POST /friends/requests { handle } — send a request (or accept if they already asked me).
export const sendRequest = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const target = await findUserByHandle(req.body.handle);
  if (String(target._id) === String(me)) throw ApiError.badRequest("You can't add yourself");

  const key = pairKey(me, target._id);
  const existing = await Friendship.findOne({ pairKey: key });

  if (existing) {
    if (existing.status === 'accepted') throw ApiError.conflict('You are already friends');
    if (String(existing.requester) === String(me)) throw ApiError.conflict('Request already sent');
    // They already asked me — adding them back simply accepts.
    await assertRoom(me);
    await assertRoom(target._id, 'They have');
    existing.status = 'accepted';
    existing.respondedAt = new Date();
    await existing.save();
    notifyFriendsChanged(me, target._id);
    return new ApiResponse(200, { relation: 'friends' }, `You and @${target.handle} are now friends`).send(res);
  }

  await assertRoom(me);
  if ((await Friendship.countDocuments({ requester: me, status: 'pending' })) >= MAX_PENDING_OUT) {
    throw ApiError.badRequest('Too many pending requests — wait for some to be answered');
  }

  let edge;
  try {
    edge = await Friendship.create({ requester: me, recipient: target._id, pairKey: key, status: 'pending' });
  } catch (err) {
    if (err?.code === 11000) throw ApiError.conflict('A request already exists');
    throw err;
  }
  notifyFriendsChanged(target._id);
  new ApiResponse(201, { relation: 'sent', requestId: String(edge._id) }, `Request sent to @${target.handle}`).send(res);
});

const loadEdge = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw ApiError.notFound('Request not found');
  const edge = await Friendship.findById(id);
  if (!edge) throw ApiError.notFound('Request not found');
  return edge;
};

// POST /friends/requests/:id/accept — only the recipient can accept.
export const acceptRequest = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const edge = await loadEdge(req.params.id);
  if (edge.status !== 'pending' || String(edge.recipient) !== String(me)) throw ApiError.notFound('Request not found');
  await assertRoom(me);
  await assertRoom(edge.requester, 'They have');
  edge.status = 'accepted';
  edge.respondedAt = new Date();
  await edge.save();
  notifyFriendsChanged(me, edge.requester);
  new ApiResponse(200, { relation: 'friends' }, 'Friend added').send(res);
});

// POST /friends/requests/:id/decline — recipient says no (the request just disappears).
export const declineRequest = asyncHandler(async (req, res) => {
  const edge = await loadEdge(req.params.id);
  if (edge.status !== 'pending' || String(edge.recipient) !== String(req.user.id)) throw ApiError.notFound('Request not found');
  await edge.deleteOne();
  notifyFriendsChanged(edge.requester);
  new ApiResponse(200, { removed: true }).send(res);
});

// DELETE /friends/requests/:id — requester cancels their own pending request.
export const cancelRequest = asyncHandler(async (req, res) => {
  const edge = await loadEdge(req.params.id);
  if (edge.status !== 'pending' || String(edge.requester) !== String(req.user.id)) throw ApiError.notFound('Request not found');
  await edge.deleteOne();
  notifyFriendsChanged(edge.recipient);
  new ApiResponse(200, { removed: true }).send(res);
});

// DELETE /friends/:userId — unfriend (both sides stop seeing each other as friends).
export const removeFriend = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) throw ApiError.notFound('Friend not found');
  const result = await Friendship.deleteOne({ pairKey: pairKey(req.user.id, userId), status: 'accepted' });
  if (!result.deletedCount) throw ApiError.notFound('Friend not found');
  notifyFriendsChanged(userId);
  new ApiResponse(200, { removed: true }).send(res);
});

// GET /friends/invite/:handle — who is behind this invite link, and where do we stand?
export const previewInvite = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const inviter = await findUserByHandle(req.params.handle.toLowerCase());
  const isSelf = String(inviter._id) === String(me);
  const edge = isSelf ? null : await Friendship.findOne({ pairKey: pairKey(me, inviter._id) }).lean();
  new ApiResponse(200, { user: publicRow(inviter), isSelf, ...relationOf(edge, me) }).send(res);
});

// POST /friends/invite/:handle — opening someone's invite link = instant friendship
// (sharing the link is their consent), no request/approve round-trip needed.
export const acceptInvite = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const inviter = await findUserByHandle(req.params.handle.toLowerCase());
  if (String(inviter._id) === String(me)) throw ApiError.badRequest("That's your own invite link");

  const key = pairKey(me, inviter._id);
  const existing = await Friendship.findOne({ pairKey: key });
  if (existing?.status === 'accepted') {
    return new ApiResponse(200, { relation: 'friends' }, `You are already friends with @${inviter.handle}`).send(res);
  }

  await assertRoom(me);
  await assertRoom(inviter._id, 'They have');

  if (existing) {
    existing.status = 'accepted';
    existing.respondedAt = new Date();
    await existing.save();
  } else {
    try {
      await Friendship.create({ requester: inviter._id, recipient: me, pairKey: key, status: 'accepted', respondedAt: new Date() });
    } catch (err) {
      if (err?.code !== 11000) throw err; // double tap — already created
    }
  }
  notifyFriendsChanged(inviter._id);
  new ApiResponse(200, { relation: 'friends' }, `You and @${inviter.handle} are now friends`).send(res);
});
