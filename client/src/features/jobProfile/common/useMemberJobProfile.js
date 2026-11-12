import { useCallback, useEffect, useState } from 'react';
import { jobProfileApi } from '../../../api/jobProfileApi';
import { normalizeProfile } from './jobProfileEntries';

const LOADING = { owner: null, profile: null, status: 'loading' };

// Loads another member's Job profile. It has the same shape as the editor of the member's own profile, with
// `readOnly: true` so every screen hides its add, edit and delete controls.
export default function useMemberJobProfile(userId) {
  const [state, setState] = useState(LOADING);

  const load = useCallback(() => {
    setState(LOADING);
    jobProfileApi
      .getMember(userId)
      .then(({ data }) => setState({ owner: data.data.user, profile: normalizeProfile(data.data.profile), status: 'ready' }))
      .catch(() => setState({ owner: null, profile: null, status: 'error' }));
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, readOnly: true, reload: load };
}
