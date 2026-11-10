import { useCallback, useState } from 'react';

// Open state of a post's comments sheet and the comment count shown on the card. The count moves as soon as someone
// comments or deletes in the sheet, without reloading the feed.
export default function useCommentsSheet(post) {
  const [open, setOpen] = useState(false);
  const [countChange, setCountChange] = useState(0);
  const changeCount = useCallback((delta) => setCountChange((previous) => previous + delta), []);
  return { open, show: () => setOpen(true), hide: () => setOpen(false), count: post.commentCount + countChange, changeCount };
}
