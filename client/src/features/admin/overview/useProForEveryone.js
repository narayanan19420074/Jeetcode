import { useEffect, useState } from 'react';
import { adminApi } from '../../../api/adminApi';
import { extractErrorMessage } from '../../../api/apiClient';

// `enabled` stays null until the current setting has loaded, so the switch
// never flashes the wrong state.
export default function useProForEveryone() {
  const [enabled, setEnabled] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi
      .getSettings()
      .then(({ data }) => setEnabled(data.data.proForEveryone))
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  const changeProForEveryone = async (nextValue) => {
    setBusy(true);
    setError(null);
    try {
      const { data } = await adminApi.setProForEveryone(nextValue);
      setEnabled(data.data.proForEveryone);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return { enabled, busy, error, changeProForEveryone };
}
