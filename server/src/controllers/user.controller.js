import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Submission } from '../models/Submission.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/users/me/activity — last 49 days of submission counts, for the
// Dashboard's GitHub-style heatmap. One aggregation query, not 49.
export const getActivityHeatmap = asyncHandler(async (req, res) => {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 48);
  since.setUTCHours(0, 0, 0, 0);

  const rows = await Submission.aggregate([
    { $match: { user: req.fullUser._id, mode: 'submit', createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
        submissions: { $sum: 1 },
      },
    },
  ]);
  const byDate = new Map(rows.map((r) => [r._id, r.submissions]));

  const days = [];
  for (let i = 0; i < 49; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    days.push({ day: i, date: key, submissions: byDate.get(key) || 0 });
  }

  new ApiResponse(200, days).send(res);
});

export const toggleBookmark = asyncHandler(async (req, res) => {
  const { problemId } = req.params;
  const user = req.fullUser;
  const idx = user.bookmarks.findIndex((id) => id.toString() === problemId);
  if (idx >= 0) user.bookmarks.splice(idx, 1);
  else user.bookmarks.push(problemId);
  await user.save();
  new ApiResponse(200, { bookmarked: idx < 0 }).send(res);
});

// PATCH /api/users/me/profile — body: { name?, avatarUrl? }. Either field
// is optional so the Settings form can save just one at a time if needed.
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatarUrl } = req.body;
  const user = req.fullUser;

  if (name !== undefined) user.name = name;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl || null;

  await user.save();
  new ApiResponse(200, user.toPublicJSON(), 'Profile updated').send(res);
});

// PATCH /api/users/me/password — body: { currentPassword?, newPassword }.
// currentPassword is required UNLESS the account has no password yet
// (OAuth-only signup) — in that case this call sets the first password,
// letting an OAuth user add email+password login without a separate flow.
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // req.fullUser (from loadFullUser) won't have passwordHash selected
  // (schema default select: false) — re-fetch it explicitly here.
  const user = await User.findById(req.fullUser._id).select('+passwordHash');

  if (user.passwordHash) {
    if (!currentPassword) {
      throw ApiError.badRequest('Current password is required to change your password');
    }
    const matches = await user.comparePassword(currentPassword);
    if (!matches) throw ApiError.unauthorized('Current password is incorrect');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  new ApiResponse(200, null, user.passwordHash ? 'Password updated' : 'Password set').send(res);
});
