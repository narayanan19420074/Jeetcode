import mongoose from 'mongoose';
import { SupportChat } from '../models/SupportChat.js';
import { SupportMessage } from '../models/SupportMessage.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const MAX_MESSAGES_PER_CHAT = 1000;
const HISTORY_LIMIT = 200;
const preview = (text) => text.replace(/\s+/g, ' ').slice(0, 160);

const chatView = (c) => ({
  id: c._id,
  topic: c.topic,
  status: c.status,
  lastMessageAt: c.lastMessageAt,
  createdAt: c.createdAt,
});

const messageView = (m) => ({
  id: m._id,
  sender: m.sender,
  text: m.text,
  createdAt: m.createdAt,
  agentName: m.sender === 'agent' ? m.author?.name || 'JeetCode Support' : undefined,
});

async function loadMessages(chatId, after) {
  const filter = { chat: chatId };
  if (after) filter.createdAt = { $gt: new Date(after) };
  // Initial load: latest N messages in chronological order. Polling: everything newer than `after`.
  const rows = after
    ? await SupportMessage.find(filter).sort({ createdAt: 1 }).limit(HISTORY_LIMIT).populate('author', 'name').lean()
    : (await SupportMessage.find(filter).sort({ createdAt: -1 }).limit(HISTORY_LIMIT).populate('author', 'name').lean()).reverse();
  return rows.map(messageView);
}

// ---------------------------------------------------------------------------
// Customer side (signed-in users)
// ---------------------------------------------------------------------------

// GET /api/support/chat?after= — the user's open conversation and its messages.
export const getMyChat = asyncHandler(async (req, res) => {
  const chat = await SupportChat.findOne({ user: req.user.id, status: 'open' }).lean();
  if (!chat) return new ApiResponse(200, { chat: null, messages: [] }).send(res);

  const messages = await loadMessages(chat._id, req.query.after);
  if (chat.unreadForUser > 0) await SupportChat.updateOne({ _id: chat._id }, { unreadForUser: 0 });
  new ApiResponse(200, { chat: chatView(chat), messages }).send(res);
});

// GET /api/support/chat/unread — number of unread agent replies (drives the launcher badge).
export const getMyUnread = asyncHandler(async (req, res) => {
  const chat = await SupportChat.findOne({ user: req.user.id, status: 'open' }).select('unreadForUser').lean();
  new ApiResponse(200, { unread: chat?.unreadForUser || 0 }).send(res);
});

// POST /api/support/chat/messages — { text, topic? }. Starts a conversation if none is open.
export const sendMyMessage = asyncHandler(async (req, res) => {
  const { text, topic } = req.body;
  const userId = req.user.id;

  let chat = await SupportChat.findOne({ user: userId, status: 'open' });
  if (!chat) {
    try {
      chat = await SupportChat.create({ user: userId, topic: topic || 'other' });
    } catch (err) {
      if (err.code !== 11000) throw err;
      chat = await SupportChat.findOne({ user: userId, status: 'open' }); // created by a parallel request
    }
  }

  if ((await SupportMessage.countDocuments({ chat: chat._id })) >= MAX_MESSAGES_PER_CHAT) {
    throw ApiError.badRequest('This conversation has reached its message limit. Please end it and start a new one.');
  }

  const msg = await SupportMessage.create({ chat: chat._id, user: userId, sender: 'user', text });
  await SupportChat.updateOne(
    { _id: chat._id },
    {
      $set: { lastMessageAt: msg.createdAt, lastMessageSender: 'user', lastMessagePreview: preview(text) },
      $inc: { unreadForAgent: 1 },
    }
  );

  new ApiResponse(201, { chat: chatView(chat), message: messageView(msg) }, 'Message sent').send(res);
});

// POST /api/support/chat/close — the user ends the conversation.
export const closeMyChat = asyncHandler(async (req, res) => {
  await SupportChat.updateOne(
    { user: req.user.id, status: 'open' },
    { status: 'closed', closedAt: new Date(), closedBy: 'user' }
  );
  new ApiResponse(200, null, 'Chat ended').send(res);
});

// ---------------------------------------------------------------------------
// Support team side (admin only — enforced by the admin router)
// ---------------------------------------------------------------------------

// GET /api/admin/support/chats?status=open|closed&page=&limit=
export const adminListChats = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const [items, total, unreadChats] = await Promise.all([
    SupportChat.find({ status })
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name handle email')
      .lean(),
    SupportChat.countDocuments({ status }),
    SupportChat.countDocuments({ status: 'open', unreadForAgent: { $gt: 0 } }),
  ]);

  new ApiResponse(200, {
    items: items.map((c) => ({
      id: c._id,
      user: c.user ? { name: c.user.name, handle: c.user.handle, email: c.user.email } : null,
      topic: c.topic,
      status: c.status,
      lastMessageAt: c.lastMessageAt,
      lastMessageSender: c.lastMessageSender,
      lastMessagePreview: c.lastMessagePreview,
      unreadForAgent: c.unreadForAgent,
    })),
    unreadChats,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }).send(res);
});

// GET /api/admin/support/chats/:id?after=
export const adminGetChat = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.notFound('Chat not found');
  const chat = await SupportChat.findById(req.params.id).populate('user', 'name handle email').lean();
  if (!chat) throw ApiError.notFound('Chat not found');

  const messages = await loadMessages(chat._id, req.query.after);
  if (chat.unreadForAgent > 0) await SupportChat.updateOne({ _id: chat._id }, { unreadForAgent: 0 });

  new ApiResponse(200, {
    chat: {
      ...chatView(chat),
      user: chat.user ? { name: chat.user.name, handle: chat.user.handle, email: chat.user.email } : null,
    },
    messages,
  }).send(res);
});

// POST /api/admin/support/chats/:id/messages — { text }
export const adminSendMessage = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.notFound('Chat not found');
  const chat = await SupportChat.findById(req.params.id);
  if (!chat) throw ApiError.notFound('Chat not found');
  if (chat.status !== 'open') throw ApiError.conflict('This chat is closed');

  const { text } = req.body;
  const msg = await SupportMessage.create({ chat: chat._id, user: chat.user, sender: 'agent', author: req.user.id, text });
  await SupportChat.updateOne(
    { _id: chat._id },
    {
      $set: { lastMessageAt: msg.createdAt, lastMessageSender: 'agent', lastMessagePreview: preview(text), unreadForAgent: 0 },
      $inc: { unreadForUser: 1 },
    }
  );
  await msg.populate('author', 'name');
  new ApiResponse(201, { message: messageView(msg) }, 'Message sent').send(res);
});

// POST /api/admin/support/chats/:id/close
export const adminCloseChat = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.notFound('Chat not found');
  const chat = await SupportChat.findOneAndUpdate(
    { _id: req.params.id, status: 'open' },
    { status: 'closed', closedAt: new Date(), closedBy: 'agent' },
    { new: true }
  );
  if (!chat) throw ApiError.notFound('Open chat not found');
  new ApiResponse(200, null, 'Chat closed').send(res);
});
