import { percentagesLessons } from './percentagesLessons';
import { numberSystemLessons } from './numberSystemLessons';
import { permutationCombinationLessons } from './permutationCombinationLessons';
import { numberSeriesLessons } from './numberSeriesLessons';
import { codingDecodingLessons } from './codingDecodingLessons';
import { bloodRelationsLessons } from './bloodRelationsLessons';
import { seatingArrangementLessons } from './seatingArrangementLessons';
import { syllogismsLessons } from './syllogismsLessons';
import { getVideoForLesson } from './lessonVideos';

// Each lesson gets its video (if one is curated) once, here, so the lesson files stay pure content
// and every page that shows a lesson receives the same stable objects.
const withVideos = (lessons) => lessons.map((lesson) => ({ ...lesson, video: getVideoForLesson(lesson.id) }));

// Learn lessons per pattern slug. Patterns without an entry here fall back to
// the legacy /learn/:slug page (or show "Coming soon" on the hub).
const RAW_LESSONS_BY_PATTERN = {
  percentages: percentagesLessons,
  'number-system': numberSystemLessons,
  'permutation-and-combination': permutationCombinationLessons,
  'number-series': numberSeriesLessons,
  'coding-decoding': codingDecodingLessons,
  'blood-relations': bloodRelationsLessons,
  'seating-arrangement': seatingArrangementLessons,
  syllogisms: syllogismsLessons,
};

const LESSONS_BY_PATTERN = Object.fromEntries(Object.entries(RAW_LESSONS_BY_PATTERN).map(([slug, lessons]) => [slug, withVideos(lessons)]));

export const getLessonsForPattern = (slug) => LESSONS_BY_PATTERN[slug] ?? null;
