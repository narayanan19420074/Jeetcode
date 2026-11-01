import { useMemo, useState } from 'react';
import { istShift, monthCells, utcKey } from '../../dashboardUtils';

const pad2 = (n) => String(n).padStart(2, '0');
const monthName = (year, month, style) => new Date(Date.UTC(year, month, 1)).toLocaleDateString('en-US', { ...style, timeZone: 'UTC' });

// Days with at least one submission in the current India month, for the monthly badge.
const countActiveDays = (byDate, year, month) => {
  const prefix = `${year}-${pad2(month + 1)}`;
  let n = 0;
  byDate.forEach((count, key) => {
    if (count > 0 && key.startsWith(prefix)) n++;
  });
  return n;
};

// The month shown in the calendar, month navigation and the numbers derived from the activity history.
export default function useStreakMonth(byDate, isAuthenticated) {
  const now = istShift(); // India date: the getUTC*() calls below read IST
  const cy = now.getUTCFullYear();
  const cm = now.getUTCMonth();
  const [shown, setShown] = useState({ y: cy, m: cm });

  const cells = useMemo(() => monthCells(shown.y, shown.m), [shown]);
  const activeThisMonth = useMemo(() => countActiveDays(byDate, cy, cm), [byDate, cy, cm]);
  const earliest = useMemo(() => (byDate.size ? [...byDate.keys()].sort()[0] : null), [byDate]);
  const monthEnd = utcKey(new Date(Date.UTC(shown.y, shown.m + 1, 0)));

  const move = (delta) =>
    setShown((s) => {
      const d = new Date(Date.UTC(s.y, s.m + delta, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    });

  return {
    cells,
    move,
    todayKey: utcKey(now),
    isCurrent: shown.y === cy && shown.m === cm,
    monthLabel: monthName(shown.y, shown.m, { month: 'long', year: 'numeric' }),
    badgeLabel: monthName(cy, cm, { month: 'short' }).toUpperCase(),
    activeThisMonth,
    beforeHistory: Boolean(isAuthenticated && earliest && monthEnd < earliest),
  };
}
