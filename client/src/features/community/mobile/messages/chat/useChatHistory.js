import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { friendsApi } from '../../../../../api/friendsApi';
import { extractErrorMessage } from '../../../../../api/apiClient';
import { setActiveChat } from '../../../../friends/friendsSlice';

const olderMessagesFirst = (older, current) => [...older.filter((message) => !current.some((item) => item.id === message.id)), ...current];

// Loads the saved messages of one conversation (newest page first, older pages on request). While the chat is open
// it is marked as the active chat, so the app shows no unread badge or toast for this friend.
export default function useChatHistory(friendId, markRead) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState({ isLoading: true, error: '' });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    dispatch(setActiveChat(friendId));
    let isCancelled = false;
    setStatus({ isLoading: true, error: '' });
    friendsApi
      .chatHistory(friendId)
      .then(({ data }) => {
        if (isCancelled) return;
        setMessages(data.data.messages);
        setHasMore(data.data.hasMore);
        setStatus({ isLoading: false, error: '' });
        markRead();
      })
      .catch((error) => !isCancelled && setStatus({ isLoading: false, error: extractErrorMessage(error) }));
    return () => {
      isCancelled = true;
      dispatch(setActiveChat(null));
    };
  }, [friendId, dispatch, markRead]);

  const loadOlder = async () => {
    if (!messages.length || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const { data } = await friendsApi.chatHistory(friendId, messages[0].createdAt);
      setMessages((current) => olderMessagesFirst(data.data.messages, current));
      setHasMore(data.data.hasMore);
    } catch (error) {
      enqueueSnackbar(extractErrorMessage(error), { variant: 'error' });
    } finally {
      setIsLoadingMore(false);
    }
  };

  return { messages, setMessages, hasMore, ...status, isLoadingMore, loadOlder };
}
