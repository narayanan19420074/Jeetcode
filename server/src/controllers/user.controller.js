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
