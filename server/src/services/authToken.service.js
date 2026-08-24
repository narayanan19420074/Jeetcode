import crypto from 'node:crypto';
import { signAccessToken, signRefreshToken } from '../utils/tokenUtils.js';
import { isProd } from '../config/env.js';

export const REFRESH_COOKIE = 'jc_refresh';

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax', // 'none' needed cross-site in prod (separate frontend/backend origins on Render)
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

/**
 * Signs a fresh access+refresh token pair, stores the refresh token's hash
 * on the user (rotation — the old one is invalidated), and sets the
 * httpOnly refresh cookie on the response. Returns the access token for
 * the JSON body.
 *
 * Used identically by password login/register/refresh AND every OAuth
 * provider (Google/GitHub/LinkedIn) — this is the one place a session
 * actually gets created, regardless of how the user proved their identity.
 */
export async function issueTokens(res, user) {
  const payload = { sub: user._id.toString(), role: user.role, handle: user.handle };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  return accessToken;
}
