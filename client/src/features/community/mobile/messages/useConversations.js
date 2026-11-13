import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatOverview, fetchFriends } from '../../../friends/friendsSlice';

const latestMessageTime = ({ last }) => (last ? Date.parse(last.at) : 0);

// Members with the newest message first; friends you have never written to follow in name order.
const byLatestMessage = (a, b) => latestMessageTime(b) - latestMessageTime(a) || a.friend.name.localeCompare(b.friend.name);

const matchesQuery = ({ name, handle }, needle) => name.toLowerCase().includes(needle) || (handle ?? '').toLowerCase().includes(needle);

// Everyone in the inbox: all friends, plus the other members you have exchanged messages with.
const mergeMembers = (friends, chatPeople) => [...new Map([...Object.values(chatPeople), ...friends].map((member) => [member.userId, member])).values()];

// The inbox is the member's friends and the other members they have chatted with, each with the latest message, unread
// count and online state. It reads the same Redux data as the Friends page, so both screens always agree. Opening the
// inbox refreshes the previews.
export default function useConversations({ open, query }) {
  const dispatch = useDispatch();
  const { friends, chatPeople, last, unread, online, loaded } = useSelector((state) => state.friends);

  useEffect(() => {
    if (!open) return;
    if (!loaded) dispatch(fetchFriends());
    dispatch(fetchChatOverview());
  }, [open, loaded, dispatch]);

  const conversations = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return mergeMembers(friends, chatPeople)
      .filter((member) => matchesQuery(member, needle))
      .map((member) => ({ friend: member, last: last[member.userId], unread: unread[member.userId] ?? 0, online: Boolean(online[member.userId]) }))
      .sort(byLatestMessage);
  }, [friends, chatPeople, last, unread, online, query]);

  return { conversations, loaded };
}
