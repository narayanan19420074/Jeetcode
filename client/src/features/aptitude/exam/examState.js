export const emptyState = () => ({ selected: null, marked: false, visited: false, time: 0 });

// Maps one question's state to the palette symbol shown to the candidate.
export function statusOf(st) {
  const answered = st.selected !== null;
  if (!st.visited) return 'notVisited';
  if (answered && st.marked) return 'answeredMarked';
  if (answered) return 'answered';
  if (st.marked) return 'marked';
  return 'notAnswered';
}
