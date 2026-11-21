import { MONTHLY_BADGE_GOAL } from '../../dashboard/dashboardUtils';

const SOLVED_MILESTONES = [1, 10, 50, 100];
const STREAK_MILESTONES = [7, 30];

const monthBadge = ({ monthLabel, activeThisMonth }) => ({
  key: 'month',
  top: monthLabel,
  value: `${Math.min(activeThisMonth, MONTHLY_BADGE_GOAL)}/${MONTHLY_BADGE_GOAL}`,
  caption: `${monthLabel} streak`,
  hint: `Be active on ${MONTHLY_BADGE_GOAL} days this month to earn it`,
  earned: activeThisMonth >= MONTHLY_BADGE_GOAL,
});

const solvedBadge = (milestone, solved) => ({
  key: `solved-${milestone}`,
  top: 'SOLVED',
  value: milestone,
  caption: milestone === 1 ? 'First solve' : `${milestone} solved`,
  hint: solved >= milestone ? `Solved ${milestone} problem${milestone === 1 ? '' : 's'}` : `Solved ${solved}/${milestone} problems`,
  earned: solved >= milestone,
});

const streakBadge = (milestone, longest) => ({
  key: `streak-${milestone}`,
  top: 'STREAK',
  value: milestone,
  caption: `${milestone}-day streak`,
  hint: longest >= milestone ? `Reached a ${milestone}-day streak` : `Best streak so far: ${longest}/${milestone} days`,
  earned: longest >= milestone,
});

// Badges are worked out from the stats we already have; nothing extra is stored.
export const buildBadges = ({ monthLabel, activeThisMonth, solved, longest }) => [
  monthBadge({ monthLabel, activeThisMonth }),
  ...SOLVED_MILESTONES.map((milestone) => solvedBadge(milestone, solved)),
  ...STREAK_MILESTONES.map((milestone) => streakBadge(milestone, longest)),
];
