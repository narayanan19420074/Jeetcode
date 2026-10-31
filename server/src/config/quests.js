// Quest + reward catalog. One place to tune rewards: change a number here and
// both the API and the Quests page follow (the client only renders what the
// server sends back).
//
// reward.type:
//   'pro'   -> grants `days` of Pro access when claimed
//   'badge' -> cosmetic badge + XP only

export const QUEST_PRO_PLAN = 'quest-reward';

// Check-in journey: one "check-in day" = an IST day with at least one Accepted
// submission. Days do NOT have to be consecutive, so a missed day never wipes
// out progress.
export const CHECKIN_MILESTONES = [
  { id: 'checkin-3', target: 3, title: 'Spark', desc: 'Check in on 3 different days.', xp: 30, reward: { type: 'badge', label: 'Spark badge' } },
  { id: 'checkin-7', target: 7, title: 'Week Warrior', desc: 'Check in on 7 different days.', xp: 70, reward: { type: 'badge', label: 'Week Warrior badge' } },
  { id: 'checkin-14', target: 14, title: 'Fortnight Fighter', desc: 'Check in on 14 different days.', xp: 150, reward: { type: 'badge', label: 'Fortnight badge' } },
  { id: 'checkin-25', target: 25, title: 'Quarter Century', desc: 'Check in on 25 different days.', xp: 300, reward: { type: 'pro', days: 7, label: '7 days Pro' } },
  { id: 'checkin-50', target: 50, title: 'Half-Century Hero', desc: 'Check in on 50 different days.', xp: 600, reward: { type: 'pro', days: 30, label: '1 month Pro' } },
  { id: 'checkin-100', target: 100, title: 'Centurion', desc: 'Check in on 100 different days.', xp: 1200, reward: { type: 'pro', days: 90, label: '3 months Pro' } },
].map((m) => ({ ...m, group: 'Check-in journey', metric: 'checkin', difficulty: null }));

export const QUESTS = [
  ...[
    { n: 3, xp: 40 },
    { n: 7, xp: 100 },
    { n: 30, xp: 400 },
  ].map(({ n, xp }) => ({ id: `streak-${n}`, group: 'Streaks', metric: 'streak', target: n, title: `${n}-day streak`, desc: `Be active ${n} days in a row.`, xp, difficulty: null, reward: { type: 'badge', label: `${n}-day streak badge` } })),
  ...[
    { n: 5, xp: 50 },
    { n: 25, xp: 150 },
    { n: 100, xp: 500 },
  ].map(({ n, xp }) => ({ id: `solved-${n}`, group: 'Problems solved', metric: 'total', target: n, title: `Solve ${n} problems`, desc: `Get ${n} problems to Accepted.`, xp, difficulty: null, reward: { type: 'badge', label: `${n} solved badge` } })),
  { id: 'easy-10', group: 'By difficulty', metric: 'easy', target: 10, title: 'Ten easy wins', desc: 'Solve 10 Easy problems.', xp: 80, difficulty: 'Easy', reward: { type: 'badge', label: 'Easy Rider badge' } },
  { id: 'medium-10', group: 'By difficulty', metric: 'medium', target: 10, title: 'Medium rare', desc: 'Solve 10 Medium problems.', xp: 120, difficulty: 'Medium', reward: { type: 'badge', label: 'Medium Rare badge' } },
  { id: 'hard-3', group: 'By difficulty', metric: 'hard', target: 3, title: 'Into the deep end', desc: 'Solve 3 Hard problems.', xp: 150, difficulty: 'Hard', reward: { type: 'badge', label: 'Deep End badge' } },
];

export const ALL_QUESTS = [...CHECKIN_MILESTONES, ...QUESTS];
export const QUEST_BY_ID = new Map(ALL_QUESTS.map((q) => [q.id, q]));
