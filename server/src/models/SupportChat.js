import mongoose from 'mongoose';

// One live-chat conversation between a signed-in user and the support team.
// A user has at most one OPEN conversation at a time; closing it lets them start a new one.
export const CHAT_TOPICS = ['payment', 'account', 'technical', 'other'];
export const CHAT_STATUSES = ['open', 'closed'];

const supportChatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, enum: CHAT_TOPICS, default: 'other' },
    status: { type: String, enum: CHAT_STATUSES, default: 'open' },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessageSender: { type: String, enum: ['user', 'agent'], default: 'user' },
    lastMessagePreview: { type: String, default: '', maxlength: 160 },
    // Unread counters, one per side, so each side can show a badge.
    unreadForAgent: { type: Number, default: 0 },
    unreadForUser: { type: Number, default: 0 },
    closedAt: { type: Date, default: null },
    closedBy: { type: String, enum: ['user', 'agent', null], default: null },
  },
  { timestamps: true }
);

// Support inbox: open chats, newest activity first.
supportChatSchema.index({ status: 1, lastMessageAt: -1 });
// Enforces "one open chat per user" even under concurrent requests.
supportChatSchema.index({ user: 1 }, { unique: true, partialFilterExpression: { status: 'open' } });

export const SupportChat = mongoose.model('SupportChat', supportChatSchema);
