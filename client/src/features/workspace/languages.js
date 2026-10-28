// Languages offered by the problem workspace and the pair room.
export const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
];
export const LANG_SHORT = { javascript: 'JS', python: 'Py', cpp: 'C++', java: 'Java' };
export const languageLabel = (id) => LANGUAGES.find((l) => l.id === id)?.label;
