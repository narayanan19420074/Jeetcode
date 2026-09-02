import { verifyAccessToken } from '../utils/tokenUtils.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';

// Verifies the access token and attaches a minimal `req.user`. Does NOT
// hit the DB on every request — the token payload itself carries id/role,
// which is the point of JWTs at this scale (no session-store lookup per
// request). Routes that need fresh user data fetch it explicitly.
export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) throw ApiError.unauthorized('Missing access token');

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }

  req.user = { id: payload.sub, role: payload.role, handle: payload.handle };
  next();
});

// Optional auth: attaches req.user if a valid token is present, but does
// NOT reject the request otherwise. Used for routes like the problem list
// that behave slightly differently for guests vs. logged-in users
// (e.g. "solvedByMe" flag) without requiring login.
export const attachUserIfPresent = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, handle: payload.handle };
  } catch {
    // Invalid/expired token on an optional-auth route — treat as guest
    // rather than failing the request.
  }
  next();
});

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) throw ApiError.unauthorized();
  if (!roles.includes(req.user.role)) {
    throw ApiError.forbidden(`Requires one of roles: ${roles.join(', ')}`);
  }
  next();
};

// Stricter than requireRole: re-fetches the user's role from the DB
// instead of trusting the JWT payload. requireAuth's role check is fine
// for ordinary admin reads/writes, but it trusts whatever role was baked
// into the access token at login time — if an admin gets demoted mid-token
// lifetime (before it expires), requireRole alone would still let them
// through until the token naturally expires. For destructive, hard-to-undo
// actions (delete, bulk-delete) that gap isn't acceptable, so this pays
// one extra DB read to confirm the role is still current.
//
// Must run AFTER requireAuth (needs req.user.id already set).
export const requireFreshRole = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized();

    const current = await User.findById(req.user.id).select('role').lean();
    if (!current) throw ApiError.unauthorized('User no longer exists');

    if (!roles.includes(current.role)) {
      throw ApiError.forbidden(`Requires one of roles: ${roles.join(', ')}`);
    }

    // Keep req.user.role in sync for the rest of the request (e.g. audit
    // logging downstream) in case it had drifted from the token payload.
    req.user.role = current.role;
    next();
  });

// Fetches the full Mongo document when a controller needs more than the
// JWT payload (e.g. updating counters). Kept separate from requireAuth so
// routes that don't need it stay fast (no DB round-trip).
export const loadFullUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.unauthorized('User no longer exists');
  req.fullUser = user;
  next();
});
