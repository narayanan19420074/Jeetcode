export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

// Sums a { Easy, Medium, Hard } count object. Returns 0 while progress is still loading.
export const sumDifficulties = (counts) => (counts ? DIFFICULTIES.reduce((sum, level) => sum + (counts[level] || 0), 0) : 0);
