import { StudyPlan } from '../models/StudyPlan.js';
import { User } from '../models/User.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getRanking, assignRanks, getTotalUsers, publicRow, POINTS } from '../services/leaderboard.service.js';

// Score / solved count for the selected track (overall | coding | aptitude).
const scoreFor = (r, track) =>
  track === 'coding'
    ? r.easy * POINTS.easy + r.medium * POINTS.medium + r.hard * POINTS.hard
    : track === 'aptitude'
      ? r.aptitude * POINTS.aptitude
      : r.score;
const solvedFor = (r, track) => (track === 'coding' ? r.easy + r.medium + r.hard : track === 'aptitude' ? r.aptitude : r.solved);
const byScore = (a, b) => b.score - a.score || b.solved - a.solved || a.handle.localeCompare(b.handle);
// The board always shows at least this many players (fewer only if fewer users exist).
const MIN_BOARD_ROWS = 10;
const brief = (r) => (r ? { handle: r.handle, name: r.name, score: r.score, rank: r.rank } : null);

// GET /leaderboard?period=all|week|month&scope=global|friends&track=overall|coding|aptitude&q=&page=1&limit=25
// "friends" = everyone who shares at least one study plan with me.
export const getLeaderboard = asyncHandler(async (req, res) => {
  const me = req.user?.id || null;
  const { period, scope, track, q, page, limit } = req.query;

  const [entry, weekEntry] = await Promise.all([getRanking(period), period === 'week' ? null : getRanking('week')]);
  const weekRows = (weekEntry || entry).rows;
  const weekById = new Map(weekRows.map((r) => [r.userId, r]));

  // Rows re-scored for the chosen track. `recent` = questions solved in the last 7 days.
  let rows = entry.rows
    .map((r) => {
      const w = weekById.get(r.userId);
      return { ...r, score: scoreFor(r, track), solved: solvedFor(r, track), recent: w ? solvedFor(w, track) : 0 };
    })
    .filter((r) => track === 'overall' || r.score > 0);
  rows.sort(byScore);

  // Global board is never empty/short: when fewer than 10 people have scored (new site, quiet
  // week, or a track nobody has tried), top it up with 0-point users (A→Z by handle).
  // `padded` rows are display fillers only — they are not "learners" and never count as "me".
  let paddedCount = 0;
  if (scope === 'global' && rows.length < MIN_BOARD_ROWS) {
    const extra = await User.find({ role: { $ne: 'admin' }, _id: { $nin: rows.map((r) => r.userId) } })
      .sort({ handle: 1 })
      .limit(MIN_BOARD_ROWS - rows.length)
      .select('name handle avatarUrl streakDays lastActivityDate company')
      .lean();
    extra.forEach((u) =>
      rows.push({ ...publicRow(u), easy: 0, medium: 0, hard: 0, aptitude: 0, solved: 0, score: 0, recent: 0, padded: true })
    );
    paddedCount = extra.length;
  }

  // Where each learner stood a week ago (all-time board only): score minus what they earned this week.
  let prevRankById = null;
  if (period === 'all' && scope === 'global') {
    const prev = rows
      .map((r) => ({ ...r, score: Math.max(0, r.score - scoreFor(weekById.get(r.userId) || { easy: 0, medium: 0, hard: 0, aptitude: 0, score: 0 }, track)) }))
      .filter((r) => r.score > 0)
      .sort(byScore);
    prevRankById = new Map(assignRanks(prev).map((r) => [r.userId, r.rank]));
  }

  if (scope === 'friends') {
    if (!me) {
      return new ApiResponse(200, { period, scope, track, total: 0, page, limit, me: null, neighbors: null, podium: [], rows: [], stats: null, points: POINTS }).send(res);
    }
    const plans = await StudyPlan.find({ 'members.user': me }).select('members.user').lean();
    const friendIds = new Set([me]);
    plans.forEach((p) => p.members.forEach((m) => friendIds.add(String(m.user))));

    rows = rows.filter((r) => friendIds.has(r.userId));
    // Friends with no solves yet still belong on the board (at 0).
    const present = new Set(rows.map((r) => r.userId));
    const missing = [...friendIds].filter((id) => !present.has(id));
    if (missing.length) {
      const users = await User.find({ _id: { $in: missing }, role: { $ne: 'admin' } }).select('name handle avatarUrl streakDays lastActivityDate company').lean();
      users.forEach((u) =>
        rows.push({ ...publicRow(u), easy: 0, medium: 0, hard: 0, aptitude: 0, solved: 0, score: 0, recent: 0 })
      );
      rows.sort(byScore);
    }
  }

  const ranked = assignRanks(rows).map((r) => {
    const prevRank = prevRankById ? prevRankById.get(r.userId) : undefined;
    return { ...r, movement: prevRank ? prevRank - r.rank : null, isNew: prevRankById ? prevRank === undefined && r.score > 0 : false };
  });

  const myIdx = me ? ranked.findIndex((r) => r.userId === me && !r.padded) : -1;
  const mine = myIdx >= 0 ? ranked[myIdx] : null;
  // Nearest learner above / below with a different score — "12 pts to pass @x".
  let above = null;
  let below = null;
  if (mine) {
    for (let i = myIdx - 1; i >= 0; i -= 1) if (!ranked[i].padded && ranked[i].score > mine.score) { above = ranked[i]; break; }
    for (let i = myIdx + 1; i < ranked.length; i += 1) if (!ranked[i].padded && ranked[i].score < mine.score) { below = ranked[i]; break; }
  }

  const learnerCount = ranked.length - paddedCount;
  const needle = q.toLowerCase();
  const visible = needle ? ranked.filter((r) => r.handle.toLowerCase().includes(needle) || r.name.toLowerCase().includes(needle)) : ranked;
  const start = (page - 1) * limit;

  new ApiResponse(200, {
    period,
    scope,
    track,
    total: visible.length,
    page,
    limit,
    updatedAt: new Date(entry.at),
    totalUsers: await getTotalUsers(),
    me: mine,
    neighbors: mine ? { above: brief(above) && { ...brief(above), gap: above.score - mine.score }, below: brief(below) && { ...brief(below), gap: mine.score - below.score } } : null,
    // Top 3 always come back (even on page 2+ or while searching) so the podium never disappears.
    podium: ranked.slice(0, 3),
    rows: visible.slice(start, start + limit),
    stats: {
      learners: learnerCount,
      solved: ranked.reduce((n, r) => n + r.solved, 0),
      topScore: ranked[0]?.score || 0,
      topPercent: mine && learnerCount ? Math.max(1, Math.ceil((mine.rank / learnerCount) * 100)) : null,
    },
    points: POINTS,
  }).send(res);
});
