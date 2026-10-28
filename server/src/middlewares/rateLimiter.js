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
  skipSuccessfulRequests: true, // only failed attempts count — real users on a shared college/office IP aren't locked out
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

// Community writes (solutions, threads, comments, votes, reports). Keyed by
// user id so one noisy account can't spam, without punishing shared IPs.
export const communityWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  store: buildStore(),
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
  message: { success: false, message: 'You are posting too fast. Wait a moment and try again.' },
});

// Friends (search, requests, invites). Per user so shared IPs aren't punished.
export const friendsLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  store: buildStore(),
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
  message: { success: false, message: 'Too many friend actions. Wait a moment and try again.' },
});

// Endpoints that send an email (forgot password, resend verification). Counts every
// request, success or not, so nobody can use us to spam an inbox. A per-account
// 60 second cooldown in the controller is the second line of defence.
export const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 6,
  standardHeaders: true,
  legacyHeaders: false,
  store: buildStore(),
  message: { success: false, message: 'Too many email requests. Try again in a few minutes.' },
});

// Help & Support form. Counts every request so nobody can flood the inbox.
// Keyed by user id when logged in, else by IP.
export const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: buildStore(),
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
  message: { success: false, message: 'You have sent a few messages already. Please wait a bit before sending another.' },
});
