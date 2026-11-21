// Prices are the same as on the home page. Keep them in sync.
export const PRICE = { monthly: 149, yearly: 1199 };
export const PERIOD = { monthly: 'month', yearly: 'year' };
export const BILLED_PLANS = ['monthly', 'yearly'];
export const SAVING_PERCENT = Math.round((1 - PRICE.yearly / (PRICE.monthly * 12)) * 100);
export const PLAN_LABEL = { monthly: 'Monthly', yearly: 'Yearly', 'license-key': 'License key', 'quest-reward': 'Reward' };

export const FREE_FEATURES = [
  'Coding problems without company tags',
  'Aptitude patterns with lessons',
  'Dashboard, streaks and the leaderboard',
  'Pair rooms and the algorithm visualizer',
];
export const PRO_FEATURES = [
  'Every company-tagged coding problem',
  'Unlimited AI hints',
  'The full aptitude test suite',
  'Unlimited mock test attempts',
];

const FREE_PLAN_DETAIL = 'Upgrade to Pro for company-tagged problems, unlimited AI hints and unlimited mock tests.';

// Only Monthly and Yearly renew automatically and can be cancelled. License keys and quest rewards simply expire.
export const isRecurringPlan = (proPlan) => BILLED_PLANS.includes(proPlan);

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function describeProPlan(status, isRecurring) {
  if (!status) return undefined;
  const name = PLAN_LABEL[status.proPlan] || 'Pro';
  if (!status.proExpiresAt) return `${name} · No expiry`;
  return `${name} · ${isRecurring ? 'Current period ends' : 'Active until'} ${formatDate(status.proExpiresAt)}`;
}

// What the "Current plan" card shows: the plan name and, for Pro, the billing period or expiry date.
export function describeCurrentPlan({ isPro, status, isRecurring }) {
  if (!isPro) return { title: 'Free', detail: FREE_PLAN_DETAIL };
  return { title: 'Pro', detail: describeProPlan(status, isRecurring) };
}
