// Authoring helpers for built-in course content. A lesson is a list of reading blocks plus its exercises; these
// small builders keep every lesson file short and make sure each block has the same shape.

export const text = (value) => ({ type: 'text', value });
export const heading = (value) => ({ type: 'heading', value });
export const bullets = (...items) => ({ type: 'bullets', items });

// `result` is the output the learner sees when the snippet runs.
export const code = (value, result = null) => ({ type: 'code', value: value.trim(), result: result === null ? null : result.trim() });

// tone: 'tip' for good practice, 'warning' for a common mistake.
export const note = (value, tone = 'tip') => ({ type: 'note', tone, value });

// Multiple choice exercise: the learner predicts what the snippet prints. `answer` is the index of the right option.
export const predict = (id, prompt, snippet, options, answer, explanation) => ({ kind: 'predict', id, prompt, snippet: snippet.trim(), options, answer, explanation });

// Write-it-yourself exercise: a hint first, then the reference solution on request.
export const task = (id, prompt, hint, solution) => ({ kind: 'task', id, prompt, hint, solution: solution.trim() });

export const lesson = (id, title, minutes, blocks, exercises) => ({ id, title, minutes, blocks, exercises });

// level: 'beginner' | 'intermediate' | 'advanced' (see COURSE_LEVELS in courseLevels.js).
export const courseModule = (id, level, title, lessons) => ({ id, level, title, lessons });
