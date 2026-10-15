// Exam dates are stored as a real instant (midnight IST) and always shown in IST,
// so a student abroad or a device with a wrong timezone still sees the right day.
const TZ = 'Asia/Kolkata';
const day = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD

// Used by the Explore card until the server sends its own examDate (re-run the TCS NQT seed to set it).
export const TCS_NQT_FALLBACK_DATE = '2026-10-19T00:00:00+05:30';

export const formatExamDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });

/** { text, over } e.g. "in 4 days", "Tomorrow", "Today", or the exam-over message. */
export function examCountdown(d) {
  const days = Math.round((Date.parse(day(d)) - Date.parse(day(new Date()))) / 86400000);
  if (days < 0) return { text: 'Exam over · next date soon', over: true };
  if (days === 0) return { text: 'Today', over: false };
  if (days === 1) return { text: 'Tomorrow', over: false };
  return { text: `in ${days} days`, over: false };
}
