import { useEffect, useState } from 'react';
import { aptitudeApi } from '../../../api/aptitudeApi';
import { extractErrorMessage } from '../../../api/apiClient';

// What the full-page Learn route needs from the server: finished lessons, the pattern title and questions per topic.
export default function useLearnPageData(slug) {
  const [state, setState] = useState({ loading: true, error: null, savedIds: undefined, patternTitle: '', questionCounts: {} });
  useEffect(() => {
    let cancelled = false;
    aptitudeApi
      .getPattern(slug)
      .then(({ data }) => {
        if (cancelled) return;
        const { progress, pattern, practice } = data.data;
        setState({ loading: false, error: null, savedIds: progress.completedSubsections, patternTitle: pattern.title, questionCounts: Object.fromEntries(practice.bySubPattern.map((topic) => [topic.slug, topic.total])) });
      })
      .catch((err) => !cancelled && setState((previous) => ({ ...previous, loading: false, error: extractErrorMessage(err) })));
    return () => { cancelled = true; };
  }, [slug]);
  return state;
}
