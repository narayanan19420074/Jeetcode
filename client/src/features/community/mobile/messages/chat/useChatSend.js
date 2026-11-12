import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { extractErrorMessage } from '../../../../../api/apiClient';
import { setLast } from '../../../../friends/friendsSlice';
import { addUnique } from '../../../../friends/chat/chatShared';
import sendChatMessage from './sendChatMessage';

// Sending one message: it is added to the thread and becomes the preview line of this friend in the inbox.
// Resolves to true when the message was sent, so the composer knows whether to clear its text.
export default function useChatSend(friendId, setMessages) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [isSending, setIsSending] = useState(false);

  const send = async (text) => {
    const body = text.trim();
    if (!body || isSending) return false;
    setIsSending(true);
    try {
      const message = await sendChatMessage(friendId, body);
      setMessages((previous) => addUnique(previous, message));
      dispatch(setLast({ id: friendId, m: { from: message.from, kind: message.kind, text: message.text, at: message.createdAt } }));
      return true;
    } catch (error) {
      enqueueSnackbar(extractErrorMessage(error), { variant: 'error' });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { send, isSending };
}
