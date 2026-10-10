import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashToken, REFRESH_COOKIE } from '../services/authToken.service.js';
import { describeUserAgent } from '../utils/userAgent.js';
import { logSecurityEvent } from '../services/securityLog.service.js';

// These live under /api/auth (not /api/users) on purpose: the refresh cookie is
// scoped to path=/api/auth, so only requests under that prefix carry it — and
// we need the cookie to tell which session is "this device".

const sid = (hash) => hash.slice(0, 16);

const activeSessions = (user) =>
  (user?.refreshSessions ?? []).filter((s) => !s.graceUntil); // rotated sessions in their grace window are not real devices

// GET /api/auth/sessions
export const listSessions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+refreshSessions');
  if (!user) throw ApiError.unauthorized('User no longer exists');
  const cookie = req.cookies?.[REFRESH_COOKIE];
  const currentHash = cookie ? hashToken(cookie) : null;

  const items = activeSessions(user)
    .map((s) => ({
      id: sid(s.hash),
      current: s.hash === currentHash,
      device: describeUserAgent(s.userAgent),
      ip: s.ip,
      signedInAt: s.loginAt || s.createdAt,
      lastActiveAt: s.lastUsedAt || s.createdAt,
    }))
    .sort((a, b) => Number(b.current) - Number(a.current) || new Date(b.lastActiveAt) - new Date(a.lastActiveAt));

  new ApiResponse(200, items).send(res);
});

// DELETE /api/auth/sessions/:id — sign one other device out.
export const revokeSession = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+refreshSessions');
  if (!user) throw ApiError.unauthorized('User no longer exists');
  const cookie = req.cookies?.[REFRESH_COOKIE];
  const currentHash = cookie ? hashToken(cookie) : null;

  const target = activeSessions(user).find((s) => sid(s.hash) === req.params.id);
  if (!target) throw ApiError.notFound('Session not found');
  if (target.hash === currentHash) throw ApiError.badRequest('This is your current session — use Log out instead');

  await User.updateOne({ _id: user._id }, { $pull: { refreshSessions: { hash: target.hash } } });
  await logSecurityEvent(user._id, req, 'session_revoked', describeUserAgent(target.userAgent).label);
  new ApiResponse(200, null, 'Session signed out').send(res);
});

// DELETE /api/auth/sessions — sign out everywhere except this device.
export const revokeOtherSessions = asyncHandler(async (req, res) => {
  const cookie = req.cookies?.[REFRESH_COOKIE];
  if (!cookie) throw ApiError.badRequest("Couldn't identify this device — log in again first");
  const currentHash = hashToken(cookie);

  const user = await User.findById(req.user.id).select('+refreshSessions');
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (!(user.refreshSessions ?? []).some((s) => s.hash === currentHash)) {
    throw ApiError.badRequest("Couldn't identify this device — log in again first");
  }

  const before = activeSessions(user).length;
  await User.updateOne({ _id: user._id }, { $pull: { refreshSessions: { hash: { $ne: currentHash } } } });
  await logSecurityEvent(user._id, req, 'sessions_revoked_all', `${Math.max(0, before - 1)} other session(s)`);
  new ApiResponse(200, { revoked: Math.max(0, before - 1) }, 'Signed out of all other sessions').send(res);
});
