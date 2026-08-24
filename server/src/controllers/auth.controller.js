import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokenUtils.js';
import { env, isProd } from '../config/env.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const REFRESH_COOKIE = 'jc_refresh';
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax', // 'none' needed cross-site in prod (separate frontend/backend origins on Render)
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

async function issueTokens(res, user) {
  const payload = { sub: user._id.toString(), role: user.role, handle: user.handle };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  return accessToken;
}

export const register = asyncHandler(async (req, res) => {
  const { name, handle, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { handle }] });
  if (existing) {
    throw ApiError.conflict(existing.email === email ? 'Email already registered' : 'Handle already taken');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, handle, email, passwordHash });

  const accessToken = await issueTokens(res, user);
  new ApiResponse(201, { accessToken, user: user.toPublicJSON() }, 'Account created').send(res);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = await issueTokens(res, user);
  new ApiResponse(200, { accessToken, user: user.toPublicJSON() }, 'Logged in').send(res);
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized('No refresh token');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(payload.sub).select('+refreshTokenHash');
  if (!user || user.refreshTokenHash !== hashToken(token)) {
    // Hash mismatch means this refresh token was already rotated/used —
    // treat as possible theft and force a full re-login.
    throw ApiError.unauthorized('Refresh token no longer valid, please log in again');
  }

  const accessToken = await issueTokens(res, user); // rotates the refresh token too
  new ApiResponse(200, { accessToken, user: user.toPublicJSON() }, 'Token refreshed').send(res);
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      await User.updateOne({ _id: payload.sub }, { $set: { refreshTokenHash: null } });
    } catch {
      // Token already invalid/expired — nothing to revoke.
    }
  }
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  new ApiResponse(200, null, 'Logged out').send(res);
});

export const me = asyncHandler(async (req, res) => {
  new ApiResponse(200, req.fullUser.toPublicJSON()).send(res);
});
