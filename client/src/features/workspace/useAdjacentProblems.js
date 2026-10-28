import { useEffect, useState } from 'react';
import { problemsApi } from '../../api/problemsApi';

// Previous / next problem slugs (the arrows beside the title).
export default function useAdjacentProblems(slug) {
  const [adjacent, setAdjacent] = useState({ prev: null, next: null });
  useEffect(() => {
    if (!slug) return undefined;
    let cancelled = false;
    setAdjacent({ prev: null, next: null });
    problemsApi
      .getAdjacent(slug)
      .then(({ data }) => {
        if (!cancelled) setAdjacent({ prev: data.data.prev, next: data.data.next });
      })
      .catch(() => {}); // arrows just stay disabled
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return adjacent;
}
