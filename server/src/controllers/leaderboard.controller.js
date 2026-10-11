import { StudyPlan } from '../models/StudyPlan.js';
import { User } from '../models/User.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getRanking, assignRanks, POINTS } from '../services/leaderboard.service.js';

// GET /leaderboard?period=all|week|month&scope=global|friends&page=1&limit=50
// "friends" = everyone who shares at least one study plan with me.
export const getLeaderboard = asyncHandler(async (req, res) => {
  const me = req.user?.id || null;
  const { period, scope, page, limit } = req.query;
  const entry = await getRanking(period);
  let rows = entry.rows;

  if (scope === 'friends') {
    if (!me) return new ApiResponse(200, { period, scope, total: 0, page, limit, me: null, rows: [], points: POINTS }).send(res);

    const plans = await StudyPlan.find({ 'members.user': me }).select('members.user').lean();
    const friendIds = new Set([me]);
    plans.forEach((p) => p.members.forEach((m) => friendIds.add(String(m.user))));

    rows = rows.filter((r) => friendIds.has(r.userId));
    // Friends with no solves yet still belong on the board (at 0).
    const present = new Set(rows.map((r) => r.userId));
    const missing = [...friendIds].filter((id) => !present.has(id));
    if (missing.length) {
      const users = await User.find({ _id: { $in: missing }, role: { $ne: 'admin' } })
        .select('name handle avatarUrl streakDays company')
        .lean();
      users.forEach((u) =>
        rows.push({
          userId: String(u._id), handle: u.handle, name: u.name, avatarUrl: u.avatarUrl || null,
          company: u.company || '', streak: u.streakDays || 0,
          easy: 0, medium: 0, hard: 0, aptitude: 0, solved: 0, score: 0,
        })
      );
      rows.sort((a, b) => b.score - a.score || b.solved - a.solved || a.handle.localeCompare(b.handle));
    }
  }

  const ranked = assignRanks(rows);
  const mine = me ? ranked.find((r) => r.userId === me) || null : null;
  const start = (page - 1) * limit;

  new ApiResponse(200, {
    period,
    scope,
    total: ranked.length,
    page,
    limit,
    updatedAt: new Date(entry.at),
    me: mine,
    rows: ranked.slice(start, start + limit),
    points: POINTS,
  }).send(res);
});
