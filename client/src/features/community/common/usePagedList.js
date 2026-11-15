import { useCallback, useEffect, useState } from 'react';
import { extractErrorMessage } from '../../../api/apiClient';

// Loads a list one page at a time and appends further pages. `fetchPage(page)` must be memoised (useCallback) and
// resolve to `{ rows, totalPages }`; when it changes, the list restarts from page 1.
export default function usePagedList(fetchPage) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(
    async (pageToLoad) => {
      setLoading(true);
      setError('');
      try {
        const { rows, totalPages } = await fetchPage(pageToLoad);
        setItems((previous) => (pageToLoad === 1 ? rows : [...previous, ...rows]));
        setPage(pageToLoad);
        setHasMore(pageToLoad < totalPages);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [fetchPage]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  return { items, setItems, loading, error, hasMore, loadMore: () => load(page + 1), reload: () => load(1) };
}
