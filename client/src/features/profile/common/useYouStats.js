import { useCallback, useEffect, useMemo, useState } from 'react';
import { problemsApi } from '../../../api/problemsApi';
import { submissionsApi } from '../../../api/submissionsApi';
import { usersApi } from '../../../api/usersApi';
import { istShift, utcKey } from '../../dashboard/dashboardUtils';
import { buildBadges } from './youBadges';

const SUBMISSIONS_PAGE_SIZE = 15;
const EMPTY_TOTALS = { Easy: 0, Medium: 0, Hard: 0 };
const INITIAL_SUBMISSIONS = { items: [], page: 0, total: null, loading: true, error: false };

function useProgressData() {
  const [totals, setTotals] = useState(EMPTY_TOTALS);
  const [activity, setActivity] = useState([]);
  useEffect(() => {
    problemsApi.getProgress().then(({ data }) => setTotals(data.data.total)).catch(() => {});
    usersApi.activity().then(({ data }) => setActivity(data.data)).catch(() => {});
  }, []);
  return { totals, activity };
}

function useSubmissionHistory() {
  const [subs, setSubs] = useState(INITIAL_SUBMISSIONS);

  const loadSubs = useCallback((page, replace = false) => {
    setSubs((current) => ({ ...current, loading: true, error: false }));
    submissionsApi
      .history({ page, limit: SUBMISSIONS_PAGE_SIZE })
      .then(({ data }) => {
        const { items, pagination } = data.data;
        setSubs((current) => ({ items: replace ? items : [...current.items, ...items], page: pagination.page, total: pagination.total, loading: false, error: false }));
      })
      .catch(() => setSubs((current) => ({ ...current, loading: false, error: true })));
  }, []);

  useEffect(() => {
    loadSubs(1, true);
  }, [loadSubs]);
  return { subs, loadSubs };
}

// The monthly badge and the "active today" label follow the India calendar day, like the backend streak.
function useMonthActivity(activity) {
  return useMemo(() => {
    const now = istShift(); // the getUTC*() calls below read IST
    const monthPrefix = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const today = utcKey(now);
    return {
      monthLabel: now.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase(),
      activeThisMonth: activity.filter((entry) => entry.submissions > 0 && entry.date.startsWith(monthPrefix)).length,
      activeToday: activity.some((entry) => entry.date === today && entry.submissions > 0),
    };
  }, [activity]);
}

// All data of the My stats page: progress, submission history, this month's activity and the earned badges.
export default function useYouStats(user) {
  const { totals, activity } = useProgressData();
  const { subs, loadSubs } = useSubmissionHistory();
  const { monthLabel, activeThisMonth, activeToday } = useMonthActivity(activity);
  const easy = user?.easySolved ?? 0;
  const medium = user?.mediumSolved ?? 0;
  const hard = user?.hardSolved ?? 0;
  const solved = user?.totalSolved ?? easy + medium + hard;
  const longest = user?.longestStreak ?? 0;
  const badges = useMemo(() => buildBadges({ monthLabel, activeThisMonth, solved, longest }), [monthLabel, activeThisMonth, solved, longest]);
  const earnedCount = badges.filter((badge) => badge.earned).length;
  return { totals, activity, subs, loadSubs, activeThisMonth, activeToday, badges, earnedCount };
}
