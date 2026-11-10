import { useCallback, useEffect, useState } from 'react';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';

// Comments of one feed post, loaded each time the sheet opens so it always shows the latest.
// `onCountChange(delta)` keeps the comment count on the post card in step without reloading the feed.
export default function useCommentThread(postId, open, onCountChange) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setLoading(true);
    setError('');
    communityApi
      .listComments('posts', postId)
      .then(({ data }) => !cancelled && setComments(data.data))
      .catch((err) => !cancelled && setError(extractErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, postId]);

  const add = useCallback((comment) => {
    setComments((previous) => [...previous, comment]);
    onCountChange(1);
  }, [onCountChange]);

  // A comment that still has replies stays as "deleted" so the replies keep their place; any other is removed.
  const remove = useCallback((commentId, soft) => {
    const blank = (comment) => (comment._id === commentId ? { ...comment, isDeleted: true, body: '', score: 0 } : comment);
    setComments((previous) => (soft ? previous.map(blank) : previous.filter((comment) => comment._id !== commentId)));
    onCountChange(-1);
  }, [onCountChange]);

  return { comments, loading, error, add, remove };
}
