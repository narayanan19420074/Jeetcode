import { useState } from 'react';
import { useSelector } from 'react-redux';
import useSignInRedirect from '../../workspace/community/communityBits/useSignInRedirect';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';

const COMMENT_MAX = 3000; // same limit as the comment box inside the thread

// Comment typed into the action bar. Only accounts can comment, so a guest who taps the field is sent to sign in.
export default function usePostComment(postId, onPosted) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const redirectToSignIn = useSignInRedirect();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const change = (value) => {
    setError('');
    setText(value.slice(0, COMMENT_MAX));
  };

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await communityApi.createComment('posts', postId, { body: text.trim() });
      setText('');
      onPosted();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return { text, change, send, sending, error, isAuthenticated, redirectToSignIn };
}
