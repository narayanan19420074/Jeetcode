import { useCallback, useEffect, useState } from 'react';
import { aptitudeApi } from '../../../api/aptitudeApi';

// Lessons the learner has finished. A lesson is ticked on screen first and saved afterwards, so the page feels instant;
// if saving fails the tick is taken back and the learner can answer the check again.
export default function useLessonCompletion(slug, savedIds, lessonCount) {
  const [completed, setCompleted] = useState(() => new Set(savedIds ?? []));
  useEffect(() => { setCompleted(new Set(savedIds ?? [])); }, [savedIds]);

  const markDone = useCallback(async (lessonId) => {
    if (completed.has(lessonId)) return;
    setCompleted((previous) => new Set(previous).add(lessonId));
    try {
      await aptitudeApi.markSubsectionComplete(slug, lessonId, lessonCount);
    } catch {
      setCompleted((previous) => {
        const rolledBack = new Set(previous);
        rolledBack.delete(lessonId);
        return rolledBack;
      });
    }
  }, [completed, lessonCount, slug]);

  return { completed, markDone };
}
