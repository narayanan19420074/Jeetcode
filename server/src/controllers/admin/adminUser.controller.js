import { User } from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { logAdminAction } from '../../utils/adminAudit.js';

// GET /api/admin/users — ?filter=pro|normal, ?search=name/handle/email,
// ?page, ?limit. Same pagination shape as adminListProblems so the
// frontend's table/pagination logic can be reused across sections.
export const adminListUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, filter, search } = req.query;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const query = {};
  if (filter === 'pro') query.isPro = true;
  if (filter === 'normal') query.isPro = false;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { handle: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(query)
      .select('name handle email role isPro proExpiresAt proPlan createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query),
  ]);

  new ApiResponse(200, {
    items,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  }).send(res);
});

// PATCH /api/admin/users/:id/role — { role }. Route-level requireFreshRole
// covers the "demoted admin with a stale token" gap, same as destructive
// problem actions.
export const adminUpdateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const target = await User.findById(req.params.id);
  if (!target) throw ApiError.notFound('User not found');

  const previousRole = target.role;
  target.role = role;
  await target.save();

  await logAdminAction(req, {
    action: 'user_role_update',
    targetType: 'User',
    targetId: target._id,
    metadata: { handle: target.handle, from: previousRole, to: role },
  });

  new ApiResponse(200, target.toPublicJSON(), 'Role updated').send(res);
});

// PATCH /api/admin/users/:id/pro — { isPro, proExpiresAt? }. Writes the
// same fields the license-activation and Razorpay flows write to, so
// checkProAccess never needs to know an admin granted it manually.
export const adminSetUserPro = asyncHandler(async (req, res) => {
  const { isPro, proExpiresAt } = req.body;
  const target = await User.findById(req.params.id);
  if (!target) throw ApiError.notFound('User not found');

  target.isPro = isPro;
  target.proExpiresAt = isPro ? (proExpiresAt ? new Date(proExpiresAt) : null) : null;
  target.proPlan = isPro ? 'license-key' : null;
  await target.save();

  await logAdminAction(req, {
    action: 'user_pro_toggle',
    targetType: 'User',
    targetId: target._id,
    metadata: { handle: target.handle, isPro, proExpiresAt: target.proExpiresAt },
  });

  new ApiResponse(200, target.toPublicJSON(), isPro ? 'Pro granted' : 'Pro revoked').send(res);
});
