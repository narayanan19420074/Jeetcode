import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatOverview, fetchFriends } from '../../../friends/friendsSlice';

const latestMessageTime = ({ last }) => (last ? Date.parse(last.at) : 0);

// Friends with the newest message first; friends you have never written to follow in name order.
const byLatestMessage = (a, b) => latestMessageTime(b) - latestMessageTime(a) || a.friend.name.localeCompare(b.friend.name);

const matchesQuery = ({ name, handle }, needle) => name.toLowerCase().includes(needle) || (handle ?? '').toLowerCase().includes(needle);

// The inbox is the member's friends list with the latest message, unread count and online state of each chat. It reads
// the same Redux data as the Friends page, so both screens always agree. Opening the inbox refreshes the previews.
export default function useConversations({ open, query }) {
  const dispatch = useDispatch();
  const { friends, last, unread, online, loaded } = useSelector((state) => state.friends);

  useEffect(() => {
    if (!open) return;
    if (!loaded) dispatch(fetchFriends());
    dispatch(fetchChatOverview());
  }, [open, loaded, dispatch]);

  const conversations = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return friends
      .filter((friend) => matchesQuery(friend, needle))
      .map((friend) => ({ friend, last: last[friend.userId], unread: unread[friend.userId] ?? 0, online: Boolean(online[friend.userId]) }))
      .sort(byLatestMessage);
  }, [friends, last, unread, online, query]);

  return { conversations, loaded };
}
