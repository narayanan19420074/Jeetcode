// Shared constants + helpers for the dashboard. Everything date-related is
// UTC on purpose: the backend's streak logic (streak.service.js) and the
// activity heatmap endpoint both bucket days by UTC midnight, so the
// calendar and countdown here have to agree with them.

export const DIFF_COLOR = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' };

export const STATUS_COLOR = {
  Accepted: '#10B981',
  'Wrong Answer': '#EF4444',
  'Time Limit Exceeded': '#F59E0B',
  'Runtime Error': '#EF4444',
  'Compilation Error': '#EF4444',
  Pending: '#64748B',
  Judging: '#64748B',
};

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'difficulty-asc', label: 'Difficulty, easy to hard' },
  { value: 'difficulty-desc', label: 'Difficulty, hard to easy' },
  { value: 'acceptance-desc', label: 'Acceptance, high to low' },
  { value: 'acceptance-asc', label: 'Acceptance, low to high' },
];

// LeetCode has "Algorithms / Database / Shell..." category pills. JeetCode's
// catalogue is all DSA, so the pills here are groups of the real tags that
// exist in the database. A group only shows if at least one of its tags
// is present, so new tags never break anything (they still appear as chips).
export const CATEGORY_GROUPS = [
  { key: 'arrays', label: 'Arrays & Hashing', color: '#3B82F6', tags: ['Array', 'Hash Table', 'Prefix Sum', 'Matrix'] },
  { key: 'strings', label: 'Strings', color: '#8B5CF6', tags: ['String', 'String Matching'] },
  { key: 'search', label: 'Search & Windows', color: '#06B6D4', tags: ['Two Pointers', 'Sliding Window', 'Binary Search', 'Sorting'] },
  { key: 'dp', label: 'Dynamic Programming', color: '#F59E0B', tags: ['Dynamic Programming', 'Recursion', 'Divide and Conquer'] },
  { key: 'math', label: 'Math & Bits', color: '#10B981', tags: ['Math', 'Bit Manipulation', 'Combinatorics'] },
  {
    key: 'structures',
    label: 'Stacks & Graphs',
    color: '#EC4899',
    tags: ['Stack', 'Monotonic Stack', 'Heap', 'Linked List', 'DFS', 'Depth-First Search', 'BFS', 'Graph'],
  },
  { key: 'greedy', label: 'Greedy & Simulation', color: '#EF4444', tags: ['Greedy', 'Simulation'] },
];

// Card surface used across the dashboard. Hairline border + a faint top
// highlight in dark mode so panels read as layered glass rather than flat
// boxes. Pass as `sx={surface}` or inside an sx array.
export const surface = (t) => ({
  borderRadius: '14px',
  border: `1px solid ${t.palette.divider}`,
  backgroundColor: t.palette.background.paper,
  backgroundImage: 'none',
  boxShadow:
    t.palette.mode === 'dark'
      ? 'inset 0 1px 0 rgba(255,255,255,0.045), 0 12px 32px -18px rgba(2,6,23,0.7)'
      : '0 1px 2px rgba(15,23,42,0.04), 0 14px 32px -22px rgba(15,23,42,0.22)',
});

const DAY_MS = 86400000;

export const utcKey = (d) => d.toISOString().slice(0, 10);

export const msUntilUtcMidnight = (now = new Date()) =>
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1) - now.getTime();

export const formatCountdown = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

// Same problem all day for everyone, no backend field needed.
export const featuredPageForToday = (total) => (Math.floor(Date.now() / DAY_MS) % total) + 1;

export const daysInUtcMonth = (year, month) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

// Flat array padded with nulls to full weeks (Sunday first), each cell is
// null or { day, key }.
export function monthCells(year, month) {
  const startDow = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const total = daysInUtcMonth(year, month);
  const cells = Array(startDow).fill(null);
  for (let day = 1; day <= total; day++) {
    cells.push({ day, key: utcKey(new Date(Date.UTC(year, month, day))) });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// W1..W5 = days 1-7, 8-14, 15-21, 22-28, 29-end — same split LeetCode uses.
export function weekSegments(year, month) {
  const total = daysInUtcMonth(year, month);
  const segments = [];
  for (let start = 1, i = 1; start <= total; start += 7, i++) {
    const end = Math.min(start + 6, total);
    const len = end - start + 1;
    segments.push({ label: `W${i}`, start, end, goal: Math.min(5, Math.ceil((len * 5) / 7)) });
  }
  return segments;
}

export function timeAgo(dateLike) {
  const s = Math.max(0, (Date.now() - new Date(dateLike).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateLike).toLocaleDateString();
}

export const MONTHLY_BADGE_GOAL = 10; // active days in a month to earn the badge
