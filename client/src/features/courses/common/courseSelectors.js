const MINUTES_PER_HOUR = 60;
const OTHER_SECTION = { id: 'other', label: 'More courses', blurb: '' };

export const pluralize = (count, noun) => `${count} ${noun}${count === 1 ? '' : 's'}`;

// "45 min" below an hour, "11.8 hours" above it: the same short form the course cards use everywhere.
export function formatDuration(minutes) {
  if (minutes < MINUTES_PER_HOUR) return `${minutes} min`;
  const hours = Number((minutes / MINUTES_PER_HOUR).toFixed(1));
  return pluralize(hours, 'hour');
}

// Store items that are courses, each with the learner's own progress (null until they own it).
export function withProgress(items, ownedCourses) {
  const progressBySlug = new Map(ownedCourses.map((course) => [course.slug, course.progress]));
  return (items || []).filter((item) => item.kind === 'course').map((course) => ({ ...course, progress: progressBySlug.get(course.slug) ?? null }));
}

// Courses grouped under their section, in the order the server lists the sections. A course whose section is unknown
// still appears, under "More courses", so adding a course never hides it.
export function groupBySection(courses, sections = []) {
  const known = new Set(sections.map((section) => section.id));
  return [...sections, OTHER_SECTION]
    .map((section) => ({ ...section, courses: courses.filter((course) => (section.id === OTHER_SECTION.id ? !known.has(course.section) : course.section === section.id)) }))
    .filter((section) => section.courses.length > 0);
}

// Every lesson of every course in one list (course order, then module order), for the Lessons tab.
export function flattenLessons(courses) {
  return courses.flatMap((course) => {
    const done = new Set(course.progress?.done ?? []);
    return course.modules.flatMap((module) => module.lessons.map((lesson) => ({
      id: `${course.slug}:${lesson.key}`,
      courseSlug: course.slug,
      courseName: course.name,
      accent: course.accent,
      moduleTitle: module.title,
      title: lesson.title,
      minutes: lesson.minutes,
      kind: lesson.kind,
      done: done.has(lesson.key),
    })));
  });
}
