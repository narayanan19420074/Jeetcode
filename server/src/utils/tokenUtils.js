import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Access token: short-lived, sent on every request (Authorization header).
// Refresh token: long-lived, stored as an httpOnly cookie, only used to
// mint new access tokens. Splitting them means a stolen access token
// expires quickly, while logout can revoke the refresh token server-side.
export function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRY });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
