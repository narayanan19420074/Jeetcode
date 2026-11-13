import mongoose from 'mongoose';
import { DirectMessage } from '../models/DirectMessage.js';
import { Friendship } from '../models/Friendship.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { emitToUser } from '../realtime/hub.js';
import { pairKey, getFriendIds } from './friend.service.js';

export const MAX_TEXT = 1000;
export const PAGE = 40;
const MAX_CONVERSATIONS = 200;
// Until the other member replies, a non-friend receives only a few messages, so first contact cannot become spam.
const MESSAGES_BEFORE_REPLY = 3;

export const serialize = (m) => ({
  id: String(m._id),
  from: String(m.from),
  to: String(m.to),
  kind: m.kind,
  text: m.text,
  roomId: m.roomId || null,
  roomTitle: m.roomTitle || null,
  createdAt: new Date(m.createdAt).toISOString(),
  readAt: m.readAt ? new Date(m.readAt).toISOString() : null,
});

export const assertObjectId = (id, what = 'Friend') => {
  if (!mongoose.isValidObjectId(id)) throw ApiError.notFound(`${what} not found`);
};

const assertNotSelf = (a, b) => {
  if (String(a) === String(b)) throw ApiError.badRequest("You can't message yourself");
};

const areFriends = async (a, b) => Boolean(await Friendship.exists({ pairKey: pairKey(a, b), status: 'accepted' }));

// Nudges and pair room invitations are friends-only.
export async function assertFriends(a, b) {
  assertNotSelf(a, b);
  if (!(await areFriends(a, b))) throw ApiError.forbidden('You can only message your friends');
}

async function assertWithinFirstContactLimit(from, to) {
  const key = pairKey(from, to);
  if (await DirectMessage.exists({ pairKey: key, from: to })) return;
  const sentSoFar = await DirectMessage.countDocuments({ pairKey: key, from });
  if (sentSoFar >= MESSAGES_BEFORE_REPLY) throw ApiError.tooMany('You can send more messages after they reply.');
}

// Any member can write to any other member, as on LinkedIn. Friends are never limited; everyone else is limited until a reply.
async function assertCanMessage(from, to) {
  assertNotSelf(from, to);
  if (!(await User.exists({ _id: to, role: { $ne: 'admin' } }))) throw ApiError.notFound('Member not found');
  if (!(await areFriends(from, to))) await assertWithinFirstContactLimit(from, to);
}

const cleanText = (text) => String(text ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, MAX_TEXT);

// Save, then push to the recipient and to the sender's other tabs/devices.
export async function sendMessage({ from, to, kind = 'text', text = '', roomId = null, roomTitle = null }) {
  await (kind === 'text' ? assertCanMessage(from, to) : assertFriends(from, to));
  const clean = cleanText(text);
  if (kind === 'text' && !clean) throw ApiError.badRequest('Message is empty');

  const doc = await DirectMessage.create({ pairKey: pairKey(from, to), from, to, kind, text: clean, roomId, roomTitle });
  const msg = serialize(doc);
  emitToUser(to, 'dm:new', msg);
  emitToUser(from, 'dm:new', msg);
  return msg;
}

// Oldest -> newest page of a conversation; `before` (ISO date) loads older messages. The pair key always contains
// the caller, so nobody can read a conversation they are not part of.
export async function history(me, other, before) {
  assertNotSelf(me, other);
  const filter = { pairKey: pairKey(me, other) };
  const b = before ? new Date(before) : null;
  if (b && !Number.isNaN(b.getTime())) filter.createdAt = { $lt: b };
  const rows = await DirectMessage.find(filter).sort({ createdAt: -1 }).limit(PAGE + 1).lean();
  const hasMore = rows.length > PAGE;
  return { messages: rows.slice(0, PAGE).reverse().map(serialize), hasMore };
}

// Unread counts per sender (and the total) — drives the badges.
export async function unreadSummary(me) {
  const rows = await DirectMessage.aggregate([
    { $match: { to: new mongoose.Types.ObjectId(String(me)), readAt: null } },
    { $group: { _id: '$from', count: { $sum: 1 } } },
  ]);
  const byUser = {};
  let total = 0;
  for (const r of rows) {
    byUser[String(r._id)] = r.count;
    total += r.count;
  }
  return { byUser, total };
}

const previewOf = (m) => ({ from: String(m.from), kind: m.kind, text: m.text, at: new Date(m.createdAt).toISOString(), read: Boolean(m.readAt) });

// The newest message of each conversation, keyed by the other member's id.
async function newestMessages(me) {
  const myId = new mongoose.Types.ObjectId(String(me));
  const rows = await DirectMessage.aggregate([
    { $match: { $or: [{ from: myId }, { to: myId }] } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$pairKey', m: { $first: '$$ROOT' } } },
    { $sort: { 'm.createdAt': -1 } },
    { $limit: MAX_CONVERSATIONS },
  ]);
  return Object.fromEntries(rows.map(({ m }) => [String(m.from) === String(me) ? String(m.to) : String(m.from), previewOf(m)]));
}

// Name, handle and photo of the members in the inbox who are not friends (friends come from the friends list).
// Activity and streak are friend-only details, so they are not sent.
async function loadNonFriendCards(me, otherIds) {
  const friendIds = new Set(await getFriendIds(me));
  const strangerIds = otherIds.filter((id) => !friendIds.has(id));
  const users = await User.find({ _id: { $in: strangerIds }, role: { $ne: 'admin' } }).select('name handle avatarUrl').lean();
  return Object.fromEntries(users.map((u) => [String(u._id), { userId: String(u._id), name: u.name, handle: u.handle, avatarUrl: u.avatarUrl || null }]));
}

// Inbox data: -> { byUser: { memberId: lastMessage }, people: { memberId: card } } where `people` covers non-friends only.
export async function conversationSummaries(me) {
  const byUser = await newestMessages(me);
  return { byUser, people: await loadNonFriendCards(me, Object.keys(byUser)) };
}

export async function markRead(me, other) {
  const res = await DirectMessage.updateMany({ pairKey: pairKey(me, other), to: me, readAt: null }, { $set: { readAt: new Date() } });
  if (res.modifiedCount) emitToUser(other, 'dm:read', { by: String(me), at: new Date().toISOString() });
  // my other tabs should clear their badge too
  emitToUser(me, 'dm:cleared', { with: String(other) });
  return res.modifiedCount;
}
