import { daysUntil, formatExamDate, pickExamDate } from '../../prep/examDate';

export const UPCOMING_LIMIT = 5;
const TCS_NQT_ID = 'tcs-nqt';
const URGENT_WITHIN_DAYS = 7;

// The TCS NQT date follows the learner's prep track (and its known fallback); every other exam uses the date in the catalogue.
export const examDateOf = (exam, track) => (exam.id === TCS_NQT_ID ? pickExamDate(track?.examDate) : exam.examOn || null);

export const examDateLabel = (examOn) => (examOn ? formatExamDate(examOn) : 'Date not announced');

export function daysLabel(days) {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days`;
}

export const isUrgent = (days) => days <= URGENT_WITHIN_DAYS;

// Each exam can have two dates worth acting on: the application deadline and the exam day. Past dates are dropped.
function eventsOf(exam, track) {
  const dated = [
    { kind: 'apply', date: exam.applyBy },
    { kind: 'exam', date: examDateOf(exam, track) },
  ];
  return dated
    .filter((event) => event.date)
    .map((event) => ({ ...event, exam, days: daysUntil(event.date) }))
    .filter((event) => event.days >= 0);
}

// Priority order: the date that comes soonest is the one the learner has to act on first.
export function upcomingEvents(exams, trackFor) {
  return exams
    .flatMap((exam) => eventsOf(exam, trackFor(exam)))
    .sort((first, second) => first.days - second.days)
    .slice(0, UPCOMING_LIMIT);
}
