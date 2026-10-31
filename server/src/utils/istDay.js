// JeetCode days run on India time (IST, UTC+5:30, no daylight saving): a streak day, a check-in day and
// "today" all end at midnight IST. Stored day values (User.lastActivityDate) stay "date-only" at UTC midnight,
// exactly as before, they just name the IST date now.
export const IST_OFFSET_MS = 330 * 60 * 1000;

// The IST calendar date of `d`, as a date-only value (that date at 00:00 UTC).
export const istDateOnly = (d = new Date()) => {
  const s = new Date(new Date(d).getTime() + IST_OFFSET_MS);
  return new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()));
};

// 'YYYY-MM-DD' of the IST date of `d`.
export const istDayKey = (d = new Date()) => istDateOnly(d).toISOString().slice(0, 10);

// The real moment the IST day containing `d` began (midnight IST). Use it to compare with createdAt timestamps.
export const istDayStart = (d = new Date()) => new Date(istDateOnly(d).getTime() - IST_OFFSET_MS);
