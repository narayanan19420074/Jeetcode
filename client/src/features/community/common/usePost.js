import { useEffect, useState } from 'react';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';

export default function usePost(postId) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    communityApi
      .getPost(postId)
      .then(({ data }) => !cancelled && setPost(data.data))
      .catch((err) => !cancelled && setError(extractErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const changeCommentCount = (delta) => setPost((current) => (current ? { ...current, commentCount: current.commentCount + delta } : current));
  return { post, loading, error, changeCommentCount };
}
