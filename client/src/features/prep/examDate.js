// Exam dates are stored as a real instant (midnight IST) and always shown in IST,
// so a student abroad or a device with a wrong timezone still sees the right day.
const TZ = 'Asia/Kolkata';
const day = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD

// Next sitting per the official TCS iON NQT hub page (tcsion.com/hub/national-qualifier-test):
// test on 24 Nov 2026, apply before 12 Nov 2026. Update both when TCS announces the next cycle.
// Used whenever the server has no examDate yet, or the saved one has already passed.
export const TCS_NQT_FALLBACK_DATE = '2026-11-24T00:00:00+05:30';
export const TCS_NQT_APPLY_BY = '2026-11-12T00:00:00+05:30';

export const formatExamDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });

/** Whole days from today (IST) to the date: 0 = today, negative = already past. */
export const daysUntil = (d) => Math.round((Date.parse(day(d)) - Date.parse(day(new Date()))) / 86400000);

/** The server's date while it is still upcoming; otherwise the known next date, so a stale seed never shows "exam over". */
export function pickExamDate(serverDate) {
  if (serverDate && daysUntil(serverDate) >= 0) return serverDate;
  if (daysUntil(TCS_NQT_FALLBACK_DATE) >= 0) return TCS_NQT_FALLBACK_DATE;
  return serverDate || TCS_NQT_FALLBACK_DATE;
}

/** { text, over } e.g. "in 4 days", "Tomorrow", "Today", or the exam-over message. */
export function examCountdown(d) {
  const days = Math.round((Date.parse(day(d)) - Date.parse(day(new Date()))) / 86400000);
  if (days < 0) return { text: 'Exam over · next date soon', over: true };
  if (days === 0) return { text: 'Today', over: false };
  if (days === 1) return { text: 'Tomorrow', over: false };
  return { text: `in ${days} days`, over: false };
}
