import { useCallback, useEffect, useMemo, useState } from 'react';
import { computeProgress } from '../../common/builtInCourses';
import { readDoneKeys, writeDoneKeys } from '../../common/courseProgressStorage';

const addKey = (keys, key) => [...new Set([...keys, key])];
const removeKey = (keys, key) => keys.filter((existing) => existing !== key);

// The learner's finished lessons for one built-in course. They are read from this device once and saved on every change.
export default function useCourseProgress(course) {
  const [doneKeys, setDoneKeys] = useState(() => readDoneKeys(course.slug));
  useEffect(() => writeDoneKeys(course.slug, doneKeys), [course.slug, doneKeys]);
  const progress = useMemo(() => computeProgress(course, doneKeys), [course, doneKeys]);
  const doneSet = useMemo(() => new Set(progress.done), [progress]);
  const setDone = useCallback((key, isDone) => setDoneKeys((keys) => (isDone ? addKey(keys, key) : removeKey(keys, key))), []);
  return { progress, doneSet, setDone };
}
