import { BIG_O_COURSE } from '../content/bigO/bigOCourse';
import { DESIGN_SYSTEM_COURSE } from '../content/designSystem/designSystemCourse';
import { PYTHON_COURSE } from '../content/python/pythonCourse';
import { readDoneKeys } from './courseProgressStorage';

const BUILT_IN_COURSES = [PYTHON_COURSE, BIG_O_COURSE, DESIGN_SYSTEM_COURSE];

// Courses that ship with the app (lesson text and exercises live in the client) are listed under their own section.
export const BUILT_IN_SECTIONS = [
  { id: 'programming', label: 'Programming Languages', blurb: 'Learn a language from the first line of code, with lessons and exercises side by side.' },
  { id: 'computer-science', label: 'Computer Science', blurb: 'Understand how efficient algorithms and data structures are built and compared.' },
  { id: 'design', label: 'Design', blurb: 'Build interfaces that look consistent and work for everyone.' },
];

export const findBuiltInCourse = (slug) => BUILT_IN_COURSES.find((course) => course.slug === slug) ?? null;

// Lesson ids repeat from module to module (l1, l2, ...), so a lesson is identified by "<module id>.<lesson id>".
export const lessonKeyOf = (courseModule, courseLesson) => `${courseModule.id}.${courseLesson.id}`;

// Every lesson in learning order, each with its module.
export const listLessons = (course) => course.modules.flatMap((courseModule) => courseModule.lessons.map((courseLesson) => ({ key: lessonKeyOf(courseModule, courseLesson), module: courseModule, lesson: courseLesson })));

export function computeProgress(course, doneKeys) {
  const validKeys = new Set(listLessons(course).map((entry) => entry.key));
  const done = [...new Set(doneKeys)].filter((key) => validKeys.has(key));
  const percent = validKeys.size ? Math.round((done.length / validKeys.size) * 100) : 0;
  return { done, doneCount: done.length, lessonCount: validKeys.size, percent };
}

const sumMinutes = (course) => listLessons(course).reduce((total, entry) => total + entry.lesson.minutes, 0);

const toOutline = (courseModule) => ({
  id: courseModule.id,
  title: courseModule.title,
  lessons: courseModule.lessons.map((courseLesson) => ({ key: lessonKeyOf(courseModule, courseLesson), title: courseLesson.title, minutes: courseLesson.minutes, kind: 'lesson' })),
});

// The same shape the Courses page gets from the Store API, so one card component shows both kinds of course.
function toListing(course, doneKeys) {
  const progress = computeProgress(course, doneKeys);
  const { slug, name, blurb, desc, accent, section, level } = course;
  return { slug, name, blurb, desc, accent, section, level, kind: 'course', price: 0, image: null, builtIn: true, minutes: sumMinutes(course), lessonCount: progress.lessonCount, moduleCount: course.modules.length, owned: progress.doneCount > 0, progress, modules: course.modules.map(toOutline) };
}

export const listBuiltInCourses = () => BUILT_IN_COURSES.map((course) => toListing(course, readDoneKeys(course.slug)));
