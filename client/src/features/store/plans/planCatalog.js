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

// Only Monthly and Yearly renew automatically and can be cancelled. License keys and quest rewards simply expire.
export const isRecurringPlan = (proPlan) => BILLED_PLANS.includes(proPlan);
