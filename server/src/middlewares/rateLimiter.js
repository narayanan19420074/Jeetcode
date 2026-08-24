import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedis } from '../services/redisClient.js';
import { env } from '../config/env.js';

// In-memory store works fine for a single dev instance. In production,
// running multiple horizontally-scaled instances behind a load balancer
// needs a *shared* store (Redis) — otherwise each instance enforces its
// own separate limit and the real cap becomes limit × instanceCount.
function buildStore() {
  const redis = getRedis();
  if (!redis) return undefined; // express-rate-limit defaults to in-memory
  return new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:',
  });
}

// General API traffic — generous, mainly to blunt scraping/abuse.
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  store: buildStore(),
  message: { success: false, message: 'Too many requests, slow down a bit.' },
});

// Auth endpoints — tighter, to slow down credential-stuffing/brute force.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: buildStore(),
  message: { success: false, message: 'Too many auth attempts. Try again in a few minutes.' },
});

// Code execution — the expensive path (each call is a Judge0 request).
// This is the limiter that actually protects your Judge0 quota/cost.
export const executionLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  store: buildStore(),
  message: { success: false, message: 'Too many run/submit requests. Wait a moment before trying again.' },
});

// AI hints — the costliest endpoint per-request (real LLM API calls, billed
// per token). Keyed by user id, not IP, since it's always authenticated —
// prevents one user behind a shared/proxy IP from exhausting everyone
// else's quota, and caps actual spend per account.
export const aiHintLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  store: buildStore(),
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
  message: { success: false, message: 'You have hit the AI hint limit for now. Try again in a few minutes.' },
});
