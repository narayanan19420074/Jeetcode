// Remembers the problem the learner last worked on (this device), so the Problems page can offer "Resume".
const KEY = 'jc:last-problem';

export function saveLastProblem(userId, problem) {
  if (!problem?.slug) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ userId: userId ?? null, slug: problem.slug, title: problem.title, difficulty: problem.difficulty }));
  } catch {
    /* storage unavailable (private window): resume simply won't show */
  }
}

export function readLastProblem(userId) {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    return v?.slug && (v.userId ?? null) === (userId ?? null) ? v : null;
  } catch {
    return null;
  }
}
