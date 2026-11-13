import { useEffect, useState } from 'react';
import { problemsApi } from '../../../api/problemsApi';
import { submissionsApi } from '../../../api/submissionsApi';
import { featuredPageForToday } from '../dashboardUtils';
import useActivityDays from './useActivityDays';

// Totals and solved counts per difficulty (one call), then today's featured problem.
// The featured problem is the same deterministic "problem of the day" for everyone.
function useProgressAndFeatured(isAuthenticated) {
  const [progress, setProgress] = useState(null);
  const [featured, setFeatured] = useState(null);
  useEffect(() => {
    let cancelled = false;
    problemsApi
      .getProgress()
      .then(({ data }) => {
        if (cancelled) return null;
        setProgress(data.data);
        const total = data.data.total.Easy + data.data.total.Medium + data.data.total.Hard;
        return total > 0 ? problemsApi.list({ page: featuredPageForToday(total), limit: 1 }) : null;
      })
      .then((res) => {
        if (!cancelled && res) setFeatured(res.data.data.items[0] || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);
  return { progress, featured };
}

// The signed-in person's latest submissions. Guests have none.
function useRecentSubmissions(isAuthenticated) {
  const [submissions, setSubmissions] = useState([]);
  useEffect(() => {
    if (!isAuthenticated) {
      setSubmissions([]);
      return;
    }
    submissionsApi.history({ limit: 5 }).then(({ data }) => setSubmissions(data.data.items)).catch(() => {});
  }, [isAuthenticated]);
  return submissions;
}

export default function useDashboardData(isAuthenticated) {
  return { ...useProgressAndFeatured(isAuthenticated), activity: useActivityDays(isAuthenticated), submissions: useRecentSubmissions(isAuthenticated) };
}
