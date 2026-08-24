import Redis from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let client = null;
let attempted = false;

// Lazily creates one shared ioredis connection for the whole process
// (rate limiter + BullMQ queue both use this). Returns null when
// REDIS_URL isn't set, so every caller can gracefully fall back to
// in-memory behavior in local dev instead of crashing on startup.
export function getRedis() {
  if (client || attempted) return client;
  attempted = true;

  if (!env.REDIS_URL) {
    logger.warn('REDIS_URL not set — running without Redis (rate limits in-memory, queue inline).');
    return null;
  }

  client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
  });
  client.on('error', (err) => logger.error('Redis connection error', err));
  return client;
}
