import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { friendsApi } from '../../../../../api/friendsApi';
import { clearUnread } from '../../../../friends/friendsSlice';
import useChatHistory from './useChatHistory';
import useChatLive from './useChatLive';
import useChatSend from './useChatSend';
import useTypingSignal from './useTypingSignal';

// Everything one conversation needs: saved messages, live updates, sending and the typing signal. Opening the chat
// and every message that arrives while it is open count as read, on this device and on the server.
export default function useChatThread(friendId) {
  const dispatch = useDispatch();
  const markRead = useCallback(() => {
    dispatch(clearUnread(friendId));
    friendsApi.chatRead(friendId).catch(() => {});
  }, [dispatch, friendId]);

  const history = useChatHistory(friendId, markRead);
  const isFriendTyping = useChatLive(friendId, history.setMessages, markRead);
  const { send, isSending } = useChatSend(friendId, history.setMessages);
  const notifyTyping = useTypingSignal(friendId);

  return { ...history, isFriendTyping, send, isSending, notifyTyping };
}
