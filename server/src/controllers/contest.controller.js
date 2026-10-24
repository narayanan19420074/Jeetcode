import { CONTEST, contestWindow } from '../config/contest.js';
import { ContestApplication } from '../models/ContestApplication.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function statusNow() {
  const { start, end } = contestWindow();
  const now = Date.now();
  return now < start ? 'upcoming' : now < end ? 'live' : 'ended';
}

// Public details + live applicant count + whether the caller has applied.
async function contestInfo(userId) {
  const { start, end } = contestWindow();
  const [applicants, mine] = await Promise.all([
    ContestApplication.countDocuments({ contest: CONTEST.id }),
    userId ? ContestApplication.exists({ contest: CONTEST.id, user: userId }) : null,
  ]);
  return {
    id: CONTEST.id,
    title: CONTEST.title,
    tagline: CONTEST.tagline,
    prizePool: CONTEST.prizePool,
    problemCount: CONTEST.problemCount,
    difficulty: CONTEST.difficulty,
    durationMinutes: CONTEST.durationMinutes,
    startsAt: new Date(start).toISOString(),
    endsAt: new Date(end).toISOString(),
    serverTime: new Date().toISOString(), // the countdown uses this so a wrong phone clock can't fool it
    status: statusNow(),
    rulesVersion: CONTEST.rulesVersion,
    rules: CONTEST.rules,
    applicants,
    applied: Boolean(mine),
    winners: statusNow() === 'ended' ? CONTEST.winners || [] : [], // only exposed after the contest is over
  };
}

// GET /contests/current
export const getContest = asyncHandler(async (req, res) => {
  new ApiResponse(200, await contestInfo(req.user?.id)).send(res);
});

// POST /contests/current/apply — the person must tick "I accept the rules"
export const applyToContest = asyncHandler(async (req, res) => {
  if (statusNow() !== 'upcoming') throw ApiError.badRequest('Applications are closed');
  try {
    await ContestApplication.create({ contest: CONTEST.id, user: req.user.id, rulesVersion: CONTEST.rulesVersion });
  } catch (err) {
    if (err?.code !== 11000) throw err; // already applied: fine, treat as success
  }
  new ApiResponse(201, await contestInfo(req.user.id), 'You are in!').send(res);
});

// DELETE /contests/current/apply — withdraw, only before the start
export const withdrawFromContest = asyncHandler(async (req, res) => {
  if (statusNow() !== 'upcoming') throw ApiError.badRequest('You can no longer withdraw');
  await ContestApplication.deleteOne({ contest: CONTEST.id, user: req.user.id });
  new ApiResponse(200, await contestInfo(req.user.id), 'Application withdrawn').send(res);
});
