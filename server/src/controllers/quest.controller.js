import { User } from '../models/User.js';
import { Submission } from '../models/Submission.js';
import { ALL_QUESTS, CHECKIN_MILESTONES, QUESTS, QUEST_BY_ID, QUEST_PRO_PLAN } from '../config/quests.js';
import { COIN_RULES } from '../config/store.js';
import { BUTTERFLIES, COINS_PER_DIAMOND, MAX_CONVERT } from '../config/butterflies.js';
import { debitCoins, grantCoinsSafe } from '../services/coin.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const QUEST_USER_FIELDS = 'easySolved mediumSolved hardSolved streakDays longestStreak questClaims isPro proExpiresAt proPlan coins diamonds butterflies';
const utcKey = (d) => d.toISOString().slice(0, 10);

// Distinct UTC days on which the user had an Accepted submission. Same UTC
// day boundary as the streak service and the activity heatmap.
async function getCheckInDays(userId) {
  const rows = await Submission.aggregate([
    { $match: { user: userId, mode: 'submit', status: 'Accepted' } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } } } },
  ]);
  return new Set(rows.map((r) => r._id));
}

function metricsFor(user, days) {
  const easy = user?.easySolved ?? 0;
  const medium = user?.mediumSolved ?? 0;
  const hard = user?.hardSolved ?? 0;
  return {
    checkin: days.size,
    streak: Math.max(user?.longestStreak ?? 0, user?.streakDays ?? 0),
    total: easy + medium + hard,
    easy,
    medium,
    hard,
  };
}

// Why a Pro reward cannot be applied right now (null = fine). Paid plans are
// not touched: the Razorpay webhook rewrites proExpiresAt on every renewal,
// so bonus days added there would silently vanish.
function proBlock(user, now = new Date()) {
  const active = Boolean(user?.isPro && (!user.proExpiresAt || user.proExpiresAt > now));
  if (!active) return null;
  if (!user.proExpiresAt) return 'lifetime';
  if (user.proPlan === 'monthly' || user.proPlan === 'yearly') return 'paid';
  return null;
}

// The butterfly levels up one tier at a time, so its level is just how many tiers the user has bought.
function butterflyState(user) {
  const level = Math.min(BUTTERFLIES.length, 1 + (user?.butterflies?.length ?? 0));
  const tier = (b) => (b ? { id: b.id, name: b.name, rarity: b.rarity, cost: b.cost } : null);
  return { level, max: BUTTERFLIES.length, current: tier(BUTTERFLIES[level - 1]), next: tier(BUTTERFLIES[level]), tiers: BUTTERFLIES.map((b) => b.id) };
}

function buildState(user, days, now = new Date()) {
  const metrics = metricsFor(user, days);
  const claimed = new Set((user?.questClaims || []).map((c) => c.id));
  const shape = (q) => {
    const value = metrics[q.metric] ?? 0;
    const done = value >= q.target;
    return {
      id: q.id,
      group: q.group,
      title: q.title,
      desc: q.desc,
      target: q.target,
      value: Math.min(value, q.target),
      xp: q.xp,
      difficulty: q.difficulty,
      reward: q.reward,
      claimed: claimed.has(q.id),
      claimable: done && !claimed.has(q.id),
    };
  };

  const recent = [];
  for (let i = 13; i >= 0; i--) {
    const key = utcKey(new Date(now.getTime() - i * DAY_MS));
    recent.push({ date: key, done: days.has(key) });
  }

  return {
    guest: !user,
    activeDays: metrics.checkin,
    checkedInToday: days.has(utcKey(now)),
    streakDays: user?.streakDays ?? 0,
    longestStreak: user?.longestStreak ?? 0,
    xp: ALL_QUESTS.filter((q) => claimed.has(q.id)).reduce((sum, q) => sum + q.xp, 0),
    recent,
    milestones: CHECKIN_MILESTONES.map(shape),
    quests: QUESTS.map(shape),
    proBlock: proBlock(user, now),
    proExpiresAt: user?.isPro ? user.proExpiresAt : null,
    coins: user?.coins ?? 0,
    diamonds: user?.diamonds ?? 0,
    coinsPerDiamond: COINS_PER_DIAMOND,
    butterfly: butterflyState(user),
  };
}

// GET /api/quests — works for guests too (everything at zero) so the page can
// show the rewards before sign-up.
export const getQuests = asyncHandler(async (req, res) => {
  if (!req.user) return new ApiResponse(200, buildState(null, new Set())).send(res);
  const user = await User.findById(req.user.id).select(
    QUEST_USER_FIELDS
  );
  if (!user) throw ApiError.unauthorized('User no longer exists');
  const days = await getCheckInDays(user._id);
  new ApiResponse(200, buildState(user, days)).send(res);
});

// POST /api/quests/:id/claim — progress is re-checked on the server, so the
// client can never claim something it has not earned.
export const claimQuest = asyncHandler(async (req, res) => {
  const quest = QUEST_BY_ID.get(req.params.id);
  if (!quest) throw ApiError.notFound('Unknown quest');

  const user = await User.findById(req.user.id).select(
    QUEST_USER_FIELDS
  );
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (user.questClaims.some((c) => c.id === quest.id)) throw ApiError.conflict('Reward already claimed');

  const days = await getCheckInDays(user._id);
  if ((metricsFor(user, days)[quest.metric] ?? 0) < quest.target) throw ApiError.badRequest('Quest is not completed yet');

  const now = new Date();
  const update = { $push: { questClaims: { id: quest.id, at: now } } };
  const filter = { _id: user._id, 'questClaims.id': { $ne: quest.id } };
  let proUntil = null;

  if (quest.reward.type === 'pro') {
    const block = proBlock(user, now);
    if (block === 'lifetime') throw ApiError.conflict('You already have lifetime Pro, so there is nothing to add. Claim this later if that changes.');
    if (block === 'paid') throw ApiError.conflict('Your paid Pro plan is active. Claim this once it ends so no reward days are wasted.');

    const active = Boolean(user.isPro && user.proExpiresAt && user.proExpiresAt > now);
    const base = active ? user.proExpiresAt : now;
    proUntil = new Date(base.getTime() + quest.reward.days * DAY_MS);
    update.$set = { isPro: true, proExpiresAt: proUntil, proPlan: active ? user.proPlan || QUEST_PRO_PLAN : QUEST_PRO_PLAN };
    // Guard against two Pro claims racing on the same base date (one would overwrite the other's days).
    filter.proExpiresAt = user.proExpiresAt ?? null;
  }

  const updated = await User.findOneAndUpdate(filter, update, { new: true });
  if (!updated) throw ApiError.conflict('Could not apply the reward, please try again');

  // Every claimed quest also pays its XP as spendable coins (once, via the ledger key).
  const coinsAwarded = Math.floor(quest.xp * COIN_RULES.questXpToCoins);
  const coinRes = await grantCoinsSafe(updated._id, coinsAwarded, {
    reason: 'quest',
    title: `Quest reward: ${quest.title}`,
    refId: quest.id,
    key: `quest:${quest.id}`,
  });
  const userOut = coinRes.granted ? await User.findById(updated._id) : updated;

  new ApiResponse(
    200,
    { user: userOut.toPublicJSON(), claimed: quest.id, reward: quest.reward, xp: quest.xp, coins: coinRes.granted ? coinsAwarded : 0, proUntil, state: buildState(userOut, days, now) },
    'Reward claimed'
  ).send(res);
});

// POST /api/quests/convert { diamonds } — turns coins into diamonds at COINS_PER_DIAMOND coins each.
export const convertCoins = asyncHandler(async (req, res) => {
  const n = Number(req.body?.diamonds);
  if (!Number.isInteger(n) || n < 1 || n > MAX_CONVERT) throw ApiError.badRequest(`Pick between 1 and ${MAX_CONVERT} diamonds`);
  const cost = n * COINS_PER_DIAMOND;

  const debit = await debitCoins(req.user.id, cost, { reason: 'convert', title: `Converted ${cost} coins to ${n} diamond${n > 1 ? 's' : ''}` });
  if (!debit) throw ApiError.badRequest(`You need ${cost} coins for ${n} diamond${n > 1 ? 's' : ''}`);

  const user = await User.findByIdAndUpdate(req.user.id, { $inc: { diamonds: n } }, { new: true });
  const days = await getCheckInDays(user._id);
  new ApiResponse(200, { user: user.toPublicJSON(), state: buildState(user, days) }, `+${n} diamond${n > 1 ? 's' : ''}`).send(res);
});

// POST /api/quests/butterfly/upgrade — buys the next tier with diamonds. One atomic update: the diamond guard
// and the "not owned yet" guard sit in the filter, so two taps can never charge twice.
export const upgradeButterfly = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(QUEST_USER_FIELDS);
  if (!user) throw ApiError.unauthorized('User no longer exists');
  const next = BUTTERFLIES[1 + user.butterflies.length];
  if (!next) throw ApiError.conflict('Your butterfly is already at max level');

  const updated = await User.findOneAndUpdate(
    { _id: user._id, diamonds: { $gte: next.cost }, 'butterflies.id': { $ne: next.id } },
    { $inc: { diamonds: -next.cost }, $push: { butterflies: { id: next.id, at: new Date() } } },
    { new: true }
  );
  if (!updated) throw ApiError.badRequest(`You need ${next.cost} diamonds for ${next.name}. You have ${user.diamonds ?? 0}.`);

  const days = await getCheckInDays(updated._id);
  new ApiResponse(200, { user: updated.toPublicJSON(), state: buildState(updated, days) }, `${next.name} butterfly unlocked`).send(res);
});
