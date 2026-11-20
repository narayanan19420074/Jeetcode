import { useEffect, useState } from 'react';
import { extractErrorMessage } from '../../../api/apiClient';

export const MIN_QUERY_LENGTH = 2;
const TYPING_PAUSE_MS = 300;
const IDLE = { items: [], loading: false, error: '' };
const LOADING = { items: [], loading: true, error: '' };

// Runs a search while the person types. The request waits for a short pause in typing, so one request is sent per
// search and not one per letter. `fetchItems(needle)` must be a stable function that resolves to the list of results.
export default function useDebouncedSearch(query, fetchItems) {
  const needle = query.trim();
  const [state, setState] = useState(IDLE);

  useEffect(() => {
    if (needle.length < MIN_QUERY_LENGTH) {
      setState(IDLE);
      return undefined;
    }
    setState(LOADING);
    let isStale = false;
    const timer = setTimeout(() => {
      fetchItems(needle)
        .then((items) => !isStale && setState({ items, loading: false, error: '' }))
        .catch((err) => !isStale && setState({ items: [], loading: false, error: extractErrorMessage(err) }));
    }, TYPING_PAUSE_MS);
    return () => {
      isStale = true;
      clearTimeout(timer);
    };
  }, [needle, fetchItems]);

  return state;
}
