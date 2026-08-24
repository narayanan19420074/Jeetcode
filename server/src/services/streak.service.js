// Normalizes a Date to UTC midnight so "same day" comparisons are exact
// regardless of what time the submission happened.
function toUtcDateOnly(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Updates streak counters in place on a User document given a new
 * activity event happening "now". O(1): reads only `lastActivityDate`
 * and `streakDays` off the user doc, never scans submission history.
 *
 * Rule: consecutive UTC calendar days extend the streak; a gap of more
 * than one day resets it to 1; multiple submissions on the same day are
 * a no-op (streak already counted for today).
 */
export function applyStreakUpdate(user, now = new Date()) {
  const today = toUtcDateOnly(now);

  if (!user.lastActivityDate) {
    user.streakDays = 1;
  } else {
    const last = toUtcDateOnly(user.lastActivityDate);
    const diffDays = Math.round((today - last) / ONE_DAY_MS);

    if (diffDays === 0) {
      // Already active today — no change.
      return user;
    } else if (diffDays === 1) {
      user.streakDays += 1;
    } else {
      user.streakDays = 1;
    }
  }

  user.lastActivityDate = today;
  user.longestStreak = Math.max(user.longestStreak, user.streakDays);
  return user;
}
