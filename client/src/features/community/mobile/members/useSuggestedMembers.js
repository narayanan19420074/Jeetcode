import { useEffect, useState } from 'react';
import { communityApi } from '../../../../api/communityApi';
import { extractErrorMessage } from '../../../../api/apiClient';

const SUGGESTION_COUNT = 20;

// Members the signed-in person may want to follow, chosen by the server from their skills, college or company and the
// topics they read. Guests get none, because the list is built from an account.
export default function useSuggestedMembers(isEnabled) {
  const [state, setState] = useState({ items: [], loading: isEnabled, error: '' });

  useEffect(() => {
    if (!isEnabled) return undefined;
    let isStale = false;
    communityApi
      .suggestedMembers(SUGGESTION_COUNT)
      .then(({ data }) => !isStale && setState({ items: data.data, loading: false, error: '' }))
      .catch((err) => !isStale && setState({ items: [], loading: false, error: extractErrorMessage(err) }));
    return () => {
      isStale = true;
    };
  }, [isEnabled]);

  return state;
}
