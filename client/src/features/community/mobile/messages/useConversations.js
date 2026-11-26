import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatOverview, fetchFriends } from '../../../friends/friendsSlice';
import buildConversations from './buildConversations';

// The inbox is the member's friends and the other members they have chatted with, each with the latest message, unread
// count, online state and the tab it belongs to, plus the friend requests waiting for an answer. It reads the same Redux data as the Friends page, so both screens always
// agree. Opening the inbox refreshes the previews.
export default function useConversations({ open, query }) {
  const dispatch = useDispatch();
  const myId = useSelector((state) => state.auth.user?.id);
  const { friends, incoming, chatPeople, last, unread, online, loaded } = useSelector((state) => state.friends);

  useEffect(() => {
    if (!open) return;
    if (!loaded) dispatch(fetchFriends());
    dispatch(fetchChatOverview());
  }, [open, loaded, dispatch]);

  const conversations = useMemo(
    () => buildConversations({ friends, chatPeople, last, unread, online, query, myId }),
    [friends, chatPeople, last, unread, online, query, myId]
  );

  return { conversations, friendRequests: incoming, loaded };
}
