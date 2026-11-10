import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import useSignInRedirect from '../../workspace/community/communityBits/useSignInRedirect';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';

const COMMENT_MAX = 3000; // same limit as the server

// The "Add a comment…" field of the sheet. With `replyTo` set the text is saved as a reply to that comment.
// Only accounts can comment, so a guest who taps the field is sent to sign in.
export default function useCommentComposer({ postId, replyTo, onAdded }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const redirectToSignIn = useSignInRedirect();
  const { enqueueSnackbar } = useSnackbar();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const { data } = await communityApi.createComment('posts', postId, { body: text.trim(), ...(replyTo ? { parentId: replyTo._id } : {}) });
      setText('');
      onAdded(data.data);
    } catch (err) {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    } finally {
      setSending(false);
    }
  };

  return { text, change: (value) => setText(value.slice(0, COMMENT_MAX)), send, sending, isAuthenticated, redirectToSignIn };
}
