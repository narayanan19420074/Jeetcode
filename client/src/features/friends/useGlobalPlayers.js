import { useCallback, useEffect, useRef, useState } from 'react';
import { leaderboardApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';

const LIMIT = 25;

// Global players (the all-time leaderboard) for the Friends page: browse, search by name / handle, load more.
// Uses the existing GET /leaderboard, so no new server route is needed.
export default function useGlobalPlayers({ enabled, q }) {
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const seq = useRef(0);
  const pageRef = useRef(1);

  const load = useCallback(async (page, term) => {
    const id = ++seq.current;
    setLoading(true);
    try {
      const { data } = await leaderboardApi.get({ period: 'all', scope: 'global', track: 'overall', q: term, page, limit: LIMIT });
      if (id !== seq.current) return;
      const d = data.data;
      setRows((prev) => (page === 1 ? d.rows : [...(prev || []), ...d.rows.filter((r) => !(prev || []).some((x) => x.userId === r.userId))]));
      setTotal(d.total);
      pageRef.current = page;
      setError('');
    } catch (err) {
      if (id === seq.current) setError(extractErrorMessage(err));
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    const t = setTimeout(() => load(1, q), q ? 300 : 0);
    return () => clearTimeout(t);
  }, [enabled, q, load]);

  const loadMore = useCallback(() => load(pageRef.current + 1, q), [load, q]);
  const hasMore = rows ? rows.length < total : false;
  return { rows, loading, error, hasMore, loadMore, reload: () => load(1, q) };
}
