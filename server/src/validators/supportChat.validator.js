import { z } from 'zod';
import { CHAT_TOPICS, CHAT_STATUSES } from '../models/SupportChat.js';

export const sendChatMessageSchema = z.object({
  text: z.string().trim().min(1, 'Message cannot be empty').max(2000),
  // Only used when this message starts a new conversation.
  topic: z.enum(CHAT_TOPICS).optional(),
});

// Polling: only return messages newer than this ISO timestamp.
export const chatPollQuerySchema = z.object({
  after: z.string().datetime().optional(),
});

export const adminListChatsQuerySchema = z.object({
  status: z.enum(CHAT_STATUSES).default('open'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const adminSendChatMessageSchema = z.object({
  text: z.string().trim().min(1, 'Message cannot be empty').max(2000),
});
