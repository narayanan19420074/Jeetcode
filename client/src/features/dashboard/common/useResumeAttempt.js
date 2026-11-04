import { useMemo } from 'react';
import useStoredValue from './useStoredValue';

const RESUME_DISMISS_KEY = 'jeetcode.dismissed.resume';

// A failed or unfinished attempt on a problem that was never accepted, so the person can pick up where they left off.
const findResumeAttempt = (submissions) =>
  submissions.find(
    (attempt) =>
      attempt.problem?.slug &&
      attempt.status !== 'Accepted' &&
      !submissions.some((other) => other.status === 'Accepted' && String(other.problem?._id) === String(attempt.problem._id))
  );

// Desktop shows the resume card whenever an attempt exists. Phones show a bar that stays dismissed once closed for that attempt.
export default function useResumeAttempt(submissions) {
  const [dismissedId, storeDismissedId] = useStoredValue(RESUME_DISMISS_KEY);
  const resume = useMemo(() => findResumeAttempt(submissions), [submissions]);
  const showResumeBar = Boolean(resume) && dismissedId !== String(resume?._id);
  return { resume, showResumeBar, dismissResume: () => storeDismissedId(String(resume._id)) };
}
