import { percentagesLessons } from './percentagesLessons';

// Learn lessons per pattern slug. Patterns without an entry here fall back to
// the legacy /learn/:slug page (or show "Coming soon" on the hub).
const LESSONS_BY_PATTERN = {
  percentages: percentagesLessons,
};

export const getLessonsForPattern = (slug) => LESSONS_BY_PATTERN[slug] ?? null;
