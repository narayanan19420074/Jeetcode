import { useEffect, useState } from 'react';
import { adminApi } from '../../../api/adminApi';
import { extractErrorMessage } from '../../../api/apiClient';

const INITIAL_STATE = { stats: null, signups: [], loading: true, error: null };

// Loads the Overview numbers and the latest signups together, so the page renders once.
export default function useAdminOverview() {
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    Promise.all([adminApi.stats(), adminApi.signups()])
      .then(([statsRes, signupsRes]) =>
        setState({ stats: statsRes.data.data, signups: signupsRes.data.data, loading: false, error: null })
      )
      .catch((err) => setState({ ...INITIAL_STATE, loading: false, error: extractErrorMessage(err) }));
  }, []);

  return state;
}
