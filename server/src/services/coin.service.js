import { User } from '../models/User.js';
import { CoinTransaction } from '../models/CoinTransaction.js';
import { COIN_RULES } from '../config/store.js';
import { logger } from '../utils/logger.js';

const isDuplicate = (err) => err?.code === 11000;

// Idempotency keys are scoped per user so the same event id can pay each user once.
const scoped = (userId, key) => (key ? `${userId}:${key}` : undefined);

export const solveReward = (difficulty) => COIN_RULES.solve[difficulty] ?? COIN_RULES.solve.Easy;

/**
 * Adds coins to a user. Ledger row first (its unique `key` is what makes the
 * grant idempotent), then an atomic $inc on the user.
 * type: 'earn' (counts toward lifetime earned) | 'refund' (gives spend back) | 'admin'.
 * Returns { granted, duplicate, amount, balance }.
 */
export async function grantCoins(userId, amount, { type = 'earn', reason, title, refId = null, key = null }) {
  const coins = Math.floor(Number(amount));
  if (!Number.isFinite(coins) || coins <= 0) return { granted: false, duplicate: false, amount: 0, balance: null };

  let tx;
  try {
    tx = await CoinTransaction.create({ user: userId, amount: coins, type, reason, title, refId, key: scoped(userId, key) });
  } catch (err) {
    if (isDuplicate(err)) return { granted: false, duplicate: true, amount: 0, balance: null };
    throw err;
  }

  const inc = { coins };
  if (type === 'earn') inc.coinsEarned = coins;
  if (type === 'refund') inc.coinsSpent = -coins;

  const user = await User.findByIdAndUpdate(userId, { $inc: inc }, { new: true }).select('coins');
  if (!user) {
    await CoinTransaction.deleteOne({ _id: tx._id }).catch(() => {});
    return { granted: false, duplicate: false, amount: 0, balance: null };
  }
  await CoinTransaction.updateOne({ _id: tx._id }, { $set: { balanceAfter: user.coins } }).catch(() => {});
  return { granted: true, duplicate: false, amount: coins, balance: user.coins };
}

// Same as grantCoins but never throws: earning coins must never break the flow
// that triggered it (a judged submission, a quest claim).
export async function grantCoinsSafe(userId, amount, opts) {
  try {
    return await grantCoins(userId, amount, opts);
  } catch (err) {
    logger.error(`grantCoins failed for ${userId} (${opts?.reason})`, err);
    return { granted: false, duplicate: false, amount: 0, balance: null };
  }
}

/**
 * Takes coins from a user atomically: the $gte guard makes it impossible to go
 * negative, even with two requests racing. Returns { amount, balance } or null
 * when the user does not have enough.
 */
export async function debitCoins(userId, amount, { type = 'spend', reason, title, refId = null, key = null }) {
  const coins = Math.floor(Number(amount));
  if (!Number.isFinite(coins) || coins <= 0) return null;

  const inc = { coins: -coins };
  if (type === 'spend') inc.coinsSpent = coins;

  const user = await User.findOneAndUpdate({ _id: userId, coins: { $gte: coins } }, { $inc: inc }, { new: true }).select('coins');
  if (!user) return null;

  try {
    await CoinTransaction.create({ user: userId, amount: -coins, type, reason, title, refId, key: scoped(userId, key), balanceAfter: user.coins });
  } catch (err) {
    // The balance already moved; a missing ledger row must not undo a real purchase.
    logger.error(`debit ledger row failed for ${userId}`, err);
  }
  return { amount: coins, balance: user.coins };
}

export async function listTransactions(userId, { page = 1, limit = 20 } = {}) {
  const filter = { user: userId };
  const [items, total] = await Promise.all([
    CoinTransaction.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    CoinTransaction.countDocuments(filter),
  ]);
  return {
    items: items.map((t) => ({ id: t._id, amount: t.amount, type: t.type, reason: t.reason, title: t.title, balanceAfter: t.balanceAfter, at: t.createdAt })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}
