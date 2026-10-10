import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Submission } from '../models/Submission.js';
import { AptitudeAttempt } from '../models/AptitudeAttempt.js';
import { AptitudeProgress } from '../models/AptitudeProgress.js';
import { AptitudeQuestionProgress } from '../models/AptitudeQuestionProgress.js';
import { UserPrepProgress } from '../models/UserPrepProgress.js';
import { REFRESH_COOKIE } from '../services/authToken.service.js';
import { logSecurityEvent } from '../services/securityLog.service.js';
import { describeUserAgent } from '../utils/userAgent.js';
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

// PATCH /api/users/me/profile — every field optional, so each Settings form can
// save just its own part. '' clears a text field.
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatarUrl, bio, location, company, website, socials } = req.body;
  const user = req.fullUser;

  if (name !== undefined) user.name = name;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl || null;
  if (bio !== undefined) user.bio = bio;
  if (location !== undefined) user.location = location;
  if (company !== undefined) user.company = company;
  if (website !== undefined) user.website = website;
  if (socials) {
    for (const [k, v] of Object.entries(socials)) user.set(`socials.${k}`, v);
  }

  await user.save();
  new ApiResponse(200, user.toPublicJSON(), 'Profile updated').send(res);
});

// PATCH /api/users/me/preferences — body: { appearance?, accessibility?, editor?, notifications? },
// each a partial object (validated + strict by preferencesPatchSchema).
export const updatePreferences = asyncHandler(async (req, res) => {
  const patch = req.body;
  const $set = {};
  for (const [section, values] of Object.entries(patch)) {
    for (const [key, value] of Object.entries(values)) $set[`preferences.${section}.${key}`] = value;
  }
  if (patch.appearance && Object.keys(patch.appearance).length) $set['preferences.appearance.syncedAt'] = new Date();
  if (!Object.keys($set).length) throw ApiError.badRequest('Nothing to update');

  const result = await User.updateOne({ _id: req.user.id }, { $set }, { runValidators: true });
  if (!result.matchedCount) throw ApiError.unauthorized('User no longer exists');
  const user = await User.findById(req.user.id);
  new ApiResponse(200, user.toPublicJSON(), 'Preferences saved').send(res);
});

// GET /api/users/me/account — what the Account / Password screens need that
// toPublicJSON deliberately does not expose (whether a password exists).
export const getAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('User no longer exists');
  new ApiResponse(200, {
    hasPassword: !!user.passwordHash,
    email: user.email,
    handle: user.handle,
    providers: { google: !!user.googleId, github: !!user.githubId, linkedin: !!user.linkedinId },
    createdAt: user.createdAt,
  }).send(res);
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

  const hadPassword = !!user.passwordHash;
  if (hadPassword) {
    if (!currentPassword) {
      throw ApiError.badRequest('Current password is required to change your password');
    }
    const matches = await user.comparePassword(currentPassword);
    if (!matches) throw ApiError.unauthorized('Current password is incorrect');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  await logSecurityEvent(user._id, req, hadPassword ? 'password_changed' : 'password_set');
  new ApiResponse(200, null, hadPassword ? 'Password updated' : 'Password set').send(res);
});

const RESERVED_HANDLES = new Set(['admin', 'administrator', 'root', 'api', 'settings', 'login', 'signup', 'support', 'help', 'jeetcode', 'system', 'moderator']);

// PATCH /api/users/me/handle — body: { handle }.
export const changeHandle = asyncHandler(async (req, res) => {
  const { handle } = req.body;
  const user = req.fullUser;
  if (handle === user.handle) throw ApiError.badRequest('That is already your handle');
  if (RESERVED_HANDLES.has(handle)) throw ApiError.conflict('That handle is reserved');
  if (await User.exists({ handle })) throw ApiError.conflict('That handle is already taken');

  const old = user.handle;
  user.handle = handle;
  try {
    await user.save();
  } catch (err) {
    if (err?.code === 11000) throw ApiError.conflict('That handle is already taken');
    throw err;
  }
  await logSecurityEvent(user._id, req, 'handle_changed', `${old} → ${handle}`);
  new ApiResponse(200, user.toPublicJSON(), 'Handle changed').send(res);
});

// GET /api/users/me/security-log — newest first.
export const getSecurityLog = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+securityLog');
  const items = [...(user?.securityLog ?? [])]
    .reverse()
    .map((e) => ({ type: e.type, detail: e.detail, at: e.at, ip: e.ip, device: describeUserAgent(e.userAgent).label }));
  new ApiResponse(200, items).send(res);
});

// GET /api/users/me/export — everything we hold about the account, as a JSON download.
export const exportData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('+securityLog')
    .populate('bookmarks', 'slug title')
    .populate('solvedProblems', 'slug title difficulty');
  if (!user) throw ApiError.unauthorized('User no longer exists');

  const [submissions, aptitudeAttempts, aptitudeProgress, questionProgress, prepProgress] = await Promise.all([
    Submission.find({ user: user._id }).sort({ createdAt: -1 }).limit(5000).populate('problem', 'slug').lean(),
    AptitudeAttempt.find({ user: user._id }).select('-answers').populate('pattern', 'slug').lean(),
    AptitudeProgress.find({ user: user._id }).populate('pattern', 'slug').lean(),
    AptitudeQuestionProgress.find({ user: user._id }).lean(),
    UserPrepProgress.find({ user: user._id }).lean(),
  ]);

  await logSecurityEvent(user._id, req, 'data_exported');

  const payload = {
    exportedAt: new Date().toISOString(),
    profile: user.toPublicJSON(),
    bookmarks: user.bookmarks.map((p) => ({ slug: p.slug, title: p.title })),
    solvedProblems: user.solvedProblems.map((p) => ({ slug: p.slug, title: p.title, difficulty: p.difficulty })),
    submissions: submissions.map((s) => ({
      problem: s.problem?.slug ?? null,
      language: s.language,
      mode: s.mode,
      status: s.status,
      passed: `${s.passedCount}/${s.totalCount}`,
      runtimeMs: s.runtimeMs,
      memoryKb: s.memoryKb,
      code: s.code,
      submittedAt: s.createdAt,
    })),
    aptitude: {
      progress: aptitudeProgress.map((p) => ({ pattern: p.pattern?.slug ?? null, bestScore: p.bestScore, attempts: p.attemptsCount, unlocked: p.unlocked, learnCompleted: p.learnCompleted })),
      attempts: aptitudeAttempts.map((a) => ({ pattern: a.pattern?.slug ?? null, mode: a.mode, status: a.status, score: a.score, correct: a.correctCount, total: a.totalCount, startedAt: a.startedAt, submittedAt: a.submittedAt })),
      questionProgress: questionProgress.length,
    },
    prepProgress: prepProgress.length,
    securityLog: (user.securityLog ?? []).map((e) => ({ type: e.type, detail: e.detail, at: e.at, ip: e.ip })),
  };

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="jeetcode-${user.handle}-export.json"`);
  res.send(JSON.stringify(payload, null, 2));
});

// POST /api/users/me/delete — body: { confirm: <your handle>, password? }.
// Removes the account and the personal progress rows that belong to it.
// Learners only: staff accounts own authored content (createdBy is required on
// problems / aptitude / prep), so those go through an admin.
export const deleteAccount = asyncHandler(async (req, res) => {
  const { confirm, password } = req.body;
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('User no longer exists');

  if (user.role !== 'learner') {
    throw ApiError.forbidden('Staff accounts cannot be self-deleted — ask an admin to change your role first');
  }
  if (confirm !== user.handle) throw ApiError.badRequest('Type your handle exactly to confirm');
  if (user.passwordHash) {
    if (!password || !(await user.comparePassword(password))) throw ApiError.unauthorized('Password is incorrect');
  }
  if (user.isPro && (user.proPlan === 'monthly' || user.proPlan === 'yearly')) {
    throw ApiError.conflict('Cancel your Pro subscription (Settings → Billing) before deleting your account');
  }

  await Promise.all([
    Submission.deleteMany({ user: user._id }),
    AptitudeAttempt.deleteMany({ user: user._id }),
    AptitudeProgress.deleteMany({ user: user._id }),
    AptitudeQuestionProgress.deleteMany({ user: user._id }),
    UserPrepProgress.deleteMany({ user: user._id }),
  ]);
  await User.deleteOne({ _id: user._id });

  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  new ApiResponse(200, null, 'Account deleted').send(res);
});
