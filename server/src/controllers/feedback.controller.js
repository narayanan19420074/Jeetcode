import mongoose from 'mongoose';
import { Feedback } from '../models/Feedback.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

// POST /api/feedback — public (guests allowed), optional auth. Rate limited in the route.
export const submitFeedback = asyncHandler(async (req, res) => {
  const { type, subject, message, name, email, pageUrl, website } = req.body;

  // Honeypot filled => bot. Pretend success so it doesn't retry.
  if (website) return new ApiResponse(201, null, 'Thanks! We got your message.').send(res);

  let userId = null;
  let finalName = name;
  let finalEmail = email;

  if (req.user?.id) {
    const u = await User.findById(req.user.id).select('name email');
    if (u) {
      userId = u._id;
      finalName = u.name;
      finalEmail = u.email;
    }
  }
  if (!finalEmail) throw ApiError.badRequest('Email is required so we can reply to you');

  const doc = await Feedback.create({
    user: userId,
    name: finalName || '',
    email: finalEmail,
    type,
    subject,
    message,
    pageUrl,
    userAgent: String(req.headers['user-agent'] || '').slice(0, 300),
  });
  logger.info(`[feedback] ${doc.type} from ${finalEmail} (${doc._id})`);

  new ApiResponse(201, { id: doc._id }, 'Thanks! We got your message.').send(res);
});

// GET /api/admin/feedback?status=&type=&page=&limit=
export const adminListFeedback = asyncHandler(async (req, res) => {
  const { status, type, page, limit } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;

  const [items, total, openCount] = await Promise.all([
    Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name handle')
      .lean(),
    Feedback.countDocuments(filter),
    Feedback.countDocuments({ status: 'open' }),
  ]);

  new ApiResponse(200, {
    items,
    openCount,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }).send(res);
});

// PATCH /api/admin/feedback/:id — { status?, adminNote? }
export const adminUpdateFeedback = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.notFound('Feedback not found');
  const update = {};
  if (req.body.status !== undefined) update.status = req.body.status;
  if (req.body.adminNote !== undefined) update.adminNote = req.body.adminNote;

  const doc = await Feedback.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    .populate('user', 'name handle')
    .lean();
  if (!doc) throw ApiError.notFound('Feedback not found');
  new ApiResponse(200, doc, 'Updated').send(res);
});
