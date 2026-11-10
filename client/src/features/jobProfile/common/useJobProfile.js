import { useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { jobProfileApi } from '../../../api/jobProfileApi';
import { normalizeProfile } from './jobProfileEntries';

// Loads the signed-in user's Job profile and saves it. A save always sends the whole profile and the
// server answers with what it stored, which becomes the new state.
export default function useJobProfile() {
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState({ profile: null, status: 'loading' });

  const load = useCallback(() => {
    setState({ profile: null, status: 'loading' });
    jobProfileApi
      .get()
      .then(({ data }) => setState({ profile: normalizeProfile(data.data), status: 'ready' }))
      .catch(() => setState({ profile: null, status: 'error' }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (nextProfile) => {
    const { data } = await jobProfileApi.save(nextProfile);
    setState({ profile: normalizeProfile(data.data), status: 'ready' });
    enqueueSnackbar('Job profile saved', { variant: 'success' });
  };

  return { ...state, reload: load, save };
}
