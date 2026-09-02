import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { issueTokens } from '../services/authToken.service.js';

// POST /api/auth/admin-login — a separate entry point from the general
// /api/auth/login. Same credential check, but rejects outright when the
// account's role isn't 'admin' — this endpoint never issues a session to
// anyone but an admin, even with fully correct credentials.
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.role !== 'admin') {
    // Deliberately the SAME generic message as a bad password — a non-admin
    // hitting this endpoint with correct credentials should never learn
    // that their password was right, or that this endpoint distinguishes
    // roles at all.
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = await issueTokens(res, user); // same refresh-cookie flow as normal login
  new ApiResponse(200, { accessToken, user: user.toPublicJSON() }, 'Logged in').send(res);
});
