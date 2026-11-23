import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listLessons } from '../../common/builtInCourses';
import useCourseProgress from './useCourseProgress';

// Where the learner lands: the lesson named in the address (?lesson=b1.l2), otherwise the first lesson they have not
// finished, otherwise the first lesson. It is decided once, so ticking a lesson off never moves the page by itself.
function resolveStartKey(entries, requestedKey, doneSet) {
  if (entries.some((entry) => entry.key === requestedKey)) return requestedKey;
  return (entries.find((entry) => !doneSet.has(entry.key)) ?? entries[0]).key;
}

// Everything the learning page needs, shared by the phone and desktop layouts: the open lesson, the lessons next to it,
// the learner's progress and the actions to move between lessons and mark one complete.
export default function useCourseWorkspace(course) {
  const { progress, doneSet, setDone } = useCourseProgress(course);
  const entries = useMemo(() => listLessons(course), [course]);
  const [params, setParams] = useSearchParams();
  const [currentKey, setCurrentKey] = useState(() => resolveStartKey(entries, params.get('lesson'), doneSet));
  const index = entries.findIndex((entry) => entry.key === currentKey);

  const selectLesson = useCallback((key) => {
    setCurrentKey(key);
    setParams({ lesson: key }, { replace: true });
    window.scrollTo({ top: 0 });
  }, [setParams]);

  const next = entries[index + 1] ?? null;
  const toggleDone = () => setDone(currentKey, !doneSet.has(currentKey));
  const completeAndContinue = () => {
    setDone(currentKey, true);
    if (next) selectLesson(next.key);
  };

  return { course, current: entries[index], previous: entries[index - 1] ?? null, next, progress, doneSet, selectLesson, toggleDone, completeAndContinue };
}
