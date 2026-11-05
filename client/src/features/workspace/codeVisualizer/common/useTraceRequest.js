import { useEffect, useState } from 'react';
import { visualizerApi } from '../../../../api/visualizerApi';
import { extractErrorMessage } from '../../../../api/apiClient';
import { canVisualize } from '../visualizerLanguages';

const IDLE = { status: 'idle', trace: null, error: '' };

// Asks the server to run the learner's code on one sample case. It runs again whenever the dialog opens, the case,
// the language or the code changes, so the trace always matches what is in the editor.
export default function useTraceRequest({ open, problemSlug, language, code }) {
  const [caseIndex, setCaseIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState(IDLE);
  const [caseCount, setCaseCount] = useState(1);

  useEffect(() => {
    if (!open || !canVisualize(language)) return undefined;
    let cancelled = false;
    setState({ status: 'loading', trace: null, error: '' });
    visualizerApi
      .trace({ problemSlug, language, code, caseIndex })
      .then(({ data }) => {
        if (cancelled) return;
        setCaseCount(data.data.caseCount);
        setState({ status: 'ready', trace: { ...data.data, language }, error: '' });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', trace: null, error: extractErrorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [open, problemSlug, language, code, caseIndex, attempt]);

  return { ...state, caseIndex, caseCount, selectCase: setCaseIndex, retry: () => setAttempt((count) => count + 1) };
}
