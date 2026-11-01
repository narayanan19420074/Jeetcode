import { useCallback, useEffect, useRef, useState } from 'react';
import { problemsApi } from '../../../../api/problemsApi';
import { extractErrorMessage } from '../../../../api/apiClient';
import { EMPTY_LIST, toListParams } from './libraryConstants';

const IDLE = { loading: false, refetching: false, loadingMore: false };

// First load shows skeleton rows, a later filter change dims the list, and the next page shows a few extra rows.
const loadingFlagsFor = (page, hasLoadedBefore) => ({
  loading: page <= 1 && !hasLoadedBefore,
  refetching: page <= 1 && hasLoadedBefore,
  loadingMore: page > 1,
});

// Page 1 replaces the list (new filters); later pages are appended (infinite scroll).
const mergePage = (previous, next) => {
  if (next.pagination.page <= 1) return next;
  const seen = new Set(previous.items.map((x) => x._id));
  return { ...next, items: [...previous.items, ...next.items.filter((x) => !seen.has(x._id))] };
};

// Loads the problems for the current query. A response that arrives after a newer request was
// started is ignored, so a slow answer can never overwrite fresher results.
export default function useLibraryList(query, listRef) {
  const [data, setData] = useState(EMPTY_LIST);
  const [loadFlags, setLoadFlags] = useState({ ...IDLE, loading: true });
  const [error, setError] = useState(null);
  const [retryTick, setRetryTick] = useState(0);
  const latestRequest = useRef(0);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const requestId = ++latestRequest.current;
    const isLatest = () => requestId === latestRequest.current;
    setLoadFlags(loadingFlagsFor(query.page, hasLoaded.current));
    problemsApi
      .list(toListParams(query))
      .then(({ data: body }) => {
        if (!isLatest()) return;
        setData((previous) => mergePage(previous, body.data));
        if (body.data.pagination.page <= 1) listRef.current?.scrollTo({ top: 0, behavior: 'auto' });
        setError(null);
      })
      .catch((err) => isLatest() && setError(extractErrorMessage(err)))
      .finally(() => {
        if (!isLatest()) return;
        hasLoaded.current = true;
        setLoadFlags(IDLE);
      });
  }, [query, retryTick, listRef]);

  const retry = useCallback(() => setRetryTick((n) => n + 1), []);
  return { items: data.items, pagination: data.pagination, ...loadFlags, error, retry };
}
