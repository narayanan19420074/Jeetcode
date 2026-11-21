import { percentagesLessons } from './percentagesLessons';
import { numberSystemLessons } from './numberSystemLessons';
import { permutationCombinationLessons } from './permutationCombinationLessons';
import { numberSeriesLessons } from './numberSeriesLessons';
import { codingDecodingLessons } from './codingDecodingLessons';
import { bloodRelationsLessons } from './bloodRelationsLessons';
import { seatingArrangementLessons } from './seatingArrangementLessons';
import { syllogismsLessons } from './syllogismsLessons';

// Learn lessons per pattern slug. Patterns without an entry here fall back to
// the legacy /learn/:slug page (or show "Coming soon" on the hub).
const LESSONS_BY_PATTERN = {
  percentages: percentagesLessons,
  'number-system': numberSystemLessons,
  'permutation-and-combination': permutationCombinationLessons,
  'number-series': numberSeriesLessons,
  'coding-decoding': codingDecodingLessons,
  'blood-relations': bloodRelationsLessons,
  'seating-arrangement': seatingArrangementLessons,
  syllogisms: syllogismsLessons,
};

export const getLessonsForPattern = (slug) => LESSONS_BY_PATTERN[slug] ?? null;
