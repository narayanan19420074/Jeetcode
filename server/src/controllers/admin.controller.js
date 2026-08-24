import { User } from '../models/User.js';
import { Problem } from '../models/Problem.js';
import { Submission } from '../models/Submission.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { submissionQueue } from '../queue/submissionQueue.js';

// GET /api/admin/stats — powers the Admin Console's top stat cards.
// Every count here is either an indexed query or an $inc-maintained
// counter — nothing here is O(all submissions ever).
export const getAdminStats = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const [totalUsers, dailyActiveUsers, totalProblems, pendingReviews, submissionsToday] = await Promise.all([
    User.estimatedDocumentCount(), // fast approximate count via collection metadata, fine for a dashboard tile
    User.countDocuments({ lastActivityDate: { $gte: startOfToday } }),
    Problem.countDocuments({ isPublished: true }),
    Problem.countDocuments({ isPublished: false }),
    Submission.countDocuments({ createdAt: { $gte: startOfToday } }),
  ]);

  let queueDepth = 0;
  if (submissionQueue) {
    const counts = await submissionQueue.getJobCounts('waiting', 'active');
    queueDepth = (counts.waiting || 0) + (counts.active || 0);
  }

  new ApiResponse(200, {
    totalUsers,
    dailyActiveUsers,
    totalProblems,
    pendingReviews,
    submissionsToday,
    queueDepth,
    queueMode: submissionQueue ? 'redis' : 'inline',
  }).send(res);
});

// GET /api/admin/signups — recent registrations list.
export const getRecentSignups = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(10).select('name handle createdAt').lean();
  new ApiResponse(200, users).send(res);
});
