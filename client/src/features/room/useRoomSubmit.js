import { useCallback, useEffect, useRef, useState } from 'react';
import { submissionsApi } from '../../api/submissionsApi';
import { extractErrorMessage } from '../../api/apiClient';

// Submit from inside a pair room. Same API as the workspace, but kept local to
// the room: the workspace Redux slice drops results when no problem is open there.
async function pollUntilDone(id, alive, { maxAttempts = 20, intervalMs = 1000 } = {}) {
  for (let i = 0; i < maxAttempts; i += 1) {
    if (!alive.current) return null;
    const { data } = await submissionsApi.get(id);
    const s = data.data;
    if (s.status !== 'Pending' && s.status !== 'Judging') return s;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Judging is taking longer than expected. Check back in a moment.');
}

export default function useRoomSubmit(slug) {
  const [state, setState] = useState({ status: 'idle', result: null, error: null }); // idle | running | error
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const submit = useCallback(
    async ({ language, code }) => {
      if (!slug) return;
      setState({ status: 'running', result: null, error: null });
      try {
        const { data } = await submissionsApi.create({ problemSlug: slug, language, code, mode: 'submit' });
        const result = await pollUntilDone(data.data._id, alive);
        if (alive.current) setState({ status: 'idle', result, error: null });
      } catch (err) {
        if (alive.current) setState({ status: 'error', result: null, error: extractErrorMessage(err) });
      }
    },
    [slug]
  );

  return { ...state, submit };
}
