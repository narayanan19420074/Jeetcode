// Replies can go this deep; keep in sync with MAX_COMMENT_DEPTH on the server.
export const MAX_COMMENT_DEPTH = 3;

export const COMMENT_SORTS = [
  { value: 'relevant', label: 'Most relevant' },
  { value: 'recent', label: 'Most recent' },
];

const byTimeAscending = (a, b) => new Date(a.createdAt) - new Date(b.createdAt);

// "Most relevant" puts the best liked comments first and breaks ties with the oldest, which collected the most replies.
const SORTERS = {
  relevant: (a, b) => b.score - a.score || byTimeAscending(a, b),
  recent: (a, b) => byTimeAscending(b, a),
};

// The server sends one flat list. Top-level comments follow the chosen sort; replies always read oldest first.
export function buildCommentTree(comments, sortKey) {
  const repliesOf = new Map();
  const roots = [];
  for (const comment of comments) {
    if (!comment.parent) roots.push(comment);
    else repliesOf.set(comment.parent, [...(repliesOf.get(comment.parent) ?? []), comment]);
  }
  return { roots: roots.sort(SORTERS[sortKey]), repliesOf };
}
