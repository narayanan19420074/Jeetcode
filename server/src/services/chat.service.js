import mongoose from 'mongoose';
import { DirectMessage } from '../models/DirectMessage.js';
import { Friendship } from '../models/Friendship.js';
import { ApiError } from '../utils/ApiError.js';
import { emitToUser } from '../realtime/hub.js';
import { pairKey, getFriendIds } from './friend.service.js';

export const MAX_TEXT = 1000;
export const PAGE = 40;

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

// Chat, nudges and room invites are friends-only.
export async function assertFriends(a, b) {
  if (String(a) === String(b)) throw ApiError.badRequest("You can't message yourself");
  const ok = await Friendship.exists({ pairKey: pairKey(a, b), status: 'accepted' });
  if (!ok) throw ApiError.forbidden('You can only message your friends');
}

// Save, then push to the recipient and to the sender's other tabs/devices.
export async function sendMessage({ from, to, kind = 'text', text = '', roomId = null, roomTitle = null }) {
  await assertFriends(from, to);
  const clean = String(text ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, MAX_TEXT);
  if (kind === 'text' && !clean) throw ApiError.badRequest('Message is empty');

  const doc = await DirectMessage.create({ pairKey: pairKey(from, to), from, to, kind, text: clean, roomId, roomTitle });
  const msg = serialize(doc);
  emitToUser(to, 'dm:new', msg);
  emitToUser(from, 'dm:new', msg);
  return msg;
}

// Oldest -> newest page of a conversation; `before` (ISO date) loads older messages.
export async function history(me, other, before) {
  await assertFriends(me, other);
  const filter = { pairKey: pairKey(me, other) };
  const b = before ? new Date(before) : null;
  if (b && !Number.isNaN(b.getTime())) filter.createdAt = { $lt: b };
  const rows = await DirectMessage.find(filter).sort({ createdAt: -1 }).limit(PAGE + 1).lean();
  const hasMore = rows.length > PAGE;
  return { messages: rows.slice(0, PAGE).reverse().map(serialize), hasMore };
}

// Unread counts per friend (and the total) — drives the badges.
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

// Last message of every conversation with a friend — the preview line + time in the chat list.
// -> { byUser: { friendId: { from, kind, text, at, read } } }
export async function conversationSummaries(me) {
  const friendIds = await getFriendIds(me);
  if (!friendIds.length) return { byUser: {} };
  const keys = friendIds.map((id) => pairKey(me, id));
  const rows = await DirectMessage.aggregate([
    { $match: { pairKey: { $in: keys } } },
    { $sort: { pairKey: 1, createdAt: -1 } },
    { $group: { _id: '$pairKey', m: { $first: '$$ROOT' } } },
  ]);
  const byUser = {};
  for (const r of rows) {
    const m = r.m;
    const other = String(m.from) === String(me) ? String(m.to) : String(m.from);
    byUser[other] = { from: String(m.from), kind: m.kind, text: m.text, at: new Date(m.createdAt).toISOString(), read: Boolean(m.readAt) };
  }
  return { byUser };
}

export async function markRead(me, other) {
  const res = await DirectMessage.updateMany({ pairKey: pairKey(me, other), to: me, readAt: null }, { $set: { readAt: new Date() } });
  if (res.modifiedCount) emitToUser(other, 'dm:read', { by: String(me), at: new Date().toISOString() });
  // my other tabs should clear their badge too
  emitToUser(me, 'dm:cleared', { with: String(other) });
  return res.modifiedCount;
}
