import { z } from 'zod';
import { CHANNEL_KINDS } from '../models/CommunityChannel.js';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const listChannelsQuerySchema = z.object({
  kind: z.enum(CHANNEL_KINDS),
  // `true` returns only the channels the signed-in user has joined or subscribed to.
  mine: z.enum(['true', 'false']).optional(),
  q: z.string().trim().max(60).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(30).default(15),
});

export const createChannelSchema = z.object({
  kind: z.enum(CHANNEL_KINDS),
  name: z.string().trim().min(3).max(60),
  description: z.string().trim().max(300).default(''),
});
