import { User } from '../../models/User.js';
import { Problem } from '../../models/Problem.js';
import { Submission } from '../../models/Submission.js';
import { AdminActionLog } from '../../models/AdminActionLog.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { submissionQueue } from '../../queue/submissionQueue.js';

// GET /api/admin/stats — Overview section's top stat cards.
export const getAdminStats = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const [totalUsers, dailyActiveUsers, totalProblems, pendingReviews, submissionsToday, proUsers] = await Promise.all([
    User.estimatedDocumentCount(),
    User.countDocuments({ lastActivityDate: { $gte: startOfToday } }),
    Problem.countDocuments({ isPublished: true }),
    Problem.countDocuments({ isPublished: false }),
    Submission.countDocuments({ createdAt: { $gte: startOfToday } }),
    User.countDocuments({ isPro: true }),
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
    proUsers,
    queueDepth,
    queueMode: submissionQueue ? 'redis' : 'inline',
  }).send(res);
});

// GET /api/admin/signups — recent registrations, Overview section.
export const getRecentSignups = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(10).select('name handle createdAt').lean();
  new ApiResponse(200, users).send(res);
});

// GET /api/admin/audit-log — every logAdminAction() write, most recent
// first. Populates the acting admin's name/handle so the UI never needs
// a second lookup.
export const getAdminAuditLog = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    AdminActionLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('admin', 'name handle')
      .lean(),
    AdminActionLog.countDocuments(),
  ]);

  new ApiResponse(200, {
    items,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  }).send(res);
});
