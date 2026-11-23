// The three groups a built-in course is divided into, in learning order. Every module names one of these ids.
export const COURSE_LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export const levelLabel = (levelId) => COURSE_LEVELS.find((level) => level.id === levelId)?.label ?? '';
