import { useEffect, useState } from 'react';
import { communityApi } from '../../../../api/communityApi';
import { extractErrorMessage } from '../../../../api/apiClient';

export const MIN_QUERY_LENGTH = 2;
const TYPING_PAUSE_MS = 300;
const IDLE = { items: [], loading: false, error: '' };
const LOADING = { items: [], loading: true, error: '' };

// Searches every member account while the person types. The request waits for a short pause in typing, so one
// request is sent per search and not one per letter.
export default function useMemberSearch(query) {
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
      communityApi
        .searchMembers(needle)
        .then(({ data }) => !isStale && setState({ items: data.data, loading: false, error: '' }))
        .catch((err) => !isStale && setState({ items: [], loading: false, error: extractErrorMessage(err) }));
    }, TYPING_PAUSE_MS);
    return () => {
      isStale = true;
      clearTimeout(timer);
    };
  }, [needle]);

  return state;
}
