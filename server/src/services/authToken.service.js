import crypto from 'node:crypto';
import { signAccessToken, signRefreshToken } from '../utils/tokenUtils.js';
import { isProd } from '../config/env.js';
import { User } from '../models/User.js';
import { logSecurityEvent } from './securityLog.service.js';

export const REFRESH_COOKIE = 'jc_refresh';

const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const ROTATION_GRACE_MS = 60 * 1000; // old token still accepted for 60s after rotation
const MAX_SESSIONS = 8; // devices/browsers logged in at once per user

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax', // 'none' needed cross-site in prod (separate frontend/backend origins on Render)
  maxAge: REFRESH_MAX_AGE_MS,
  path: '/api/auth',
};

/**
 * Signs a fresh access+refresh token pair, records the refresh token's hash
 * as a session on the user, and sets the httpOnly refresh cookie.
 *
 * `previousToken` (the refresh cookie being rotated, if any) is NOT deleted
 * immediately — it gets a short grace window so concurrent refreshes with
 * the same cookie all succeed. Other devices' sessions are untouched, so
 * logging in on a phone no longer logs the laptop out.
 *
 * Every write is a single atomic Mongo operation (no read-modify-save), so
 * concurrent requests can't overwrite each other's sessions.
 */
export async function issueTokens(res, user, previousToken = null) {
  const payload = { sub: user._id.toString(), role: user.role, handle: user.handle };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const now = Date.now();

  // Device info for Settings -> Sessions. Express exposes the request as res.req,
  // so no caller needs to change.
  const req = res.req;
  const userAgent = (req?.get?.('user-agent') || '').slice(0, 300);
  const ip = req?.ip || null;
  const isRotation = /\/auth\/refresh/.test(req?.originalUrl || '');

  // 1. Drop expired sessions and rotated ones whose grace window is over.
  await Promise.all([
    User.updateOne({ _id: user._id }, { $pull: { refreshSessions: { graceUntil: { $lt: new Date(now) } } } }),
    User.updateOne(
      { _id: user._id },
      { $pull: { refreshSessions: { createdAt: { $lt: new Date(now - REFRESH_MAX_AGE_MS) } } } }
    ),
  ]);

  // 2. Put the token being rotated into its grace window (only if still active).
  if (previousToken) {
    await User.updateOne(
      { _id: user._id, 'refreshSessions.hash': hashToken(previousToken) },
      { $set: { 'refreshSessions.$[s].graceUntil': new Date(now + ROTATION_GRACE_MS) } },
      { arrayFilters: [{ 's.hash': hashToken(previousToken), 's.graceUntil': null }] }
    );
  }

  // Keep the original sign-in time across rotations.
  let loginAt = new Date(now);
  if (previousToken && isRotation) {
    const prevHash = hashToken(previousToken);
    const doc = await User.findById(user._id).select('+refreshSessions').lean();
    const prev = doc?.refreshSessions?.find((s) => s.hash === prevHash);
    if (prev) loginAt = prev.loginAt || prev.createdAt || loginAt;
  }

  // 3. Add the new session, keeping only the newest MAX_SESSIONS.
  await User.updateOne(
    { _id: user._id },
    {
      $push: {
        refreshSessions: {
          $each: [{ hash: hashToken(refreshToken), createdAt: new Date(now), graceUntil: null, userAgent, ip, loginAt, lastUsedAt: new Date(now) }],
          $slice: -MAX_SESSIONS,
        },
      },
      $set: { refreshTokenHash: null }, // legacy single-session field no longer used
    }
  );

  if (!isRotation) await logSecurityEvent(user._id, req, 'login');

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  return accessToken;
}
