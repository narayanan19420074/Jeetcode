import { inboxTabOf } from './inboxTabs';

const latestMessageTime = ({ last }) => (last ? Date.parse(last.at) : 0);

// Members with the newest message first; friends you have never written to follow in name order.
const byLatestMessage = (a, b) => latestMessageTime(b) - latestMessageTime(a) || a.friend.name.localeCompare(b.friend.name);

const matchesQuery = ({ name, handle }, needle) => name.toLowerCase().includes(needle) || (handle ?? '').toLowerCase().includes(needle);

// Everyone in the inbox: all friends, plus the other members you have exchanged messages with. A friend's card wins.
const mergeMembers = (friends, chatPeople) => [...new Map([...Object.values(chatPeople), ...friends].map((member) => [member.userId, member])).values()];

function toConversation(member, { friendIds, last, unread, online, myId }) {
  const lastMessage = last[member.userId];
  const isFriend = friendIds.has(member.userId);
  return {
    friend: member,
    last: lastMessage,
    unread: unread[member.userId] ?? 0,
    online: Boolean(online[member.userId]),
    tab: inboxTabOf({ isFriend, hasMessagedThem: member.hasMessagedThem, lastMessageFrom: lastMessage?.from, myId }),
  };
}

// One inbox entry per member, matching the search text, newest message first.
export default function buildConversations({ friends, chatPeople, last, unread, online, query, myId }) {
  const needle = query.trim().toLowerCase();
  const friendIds = new Set(friends.map((friend) => friend.userId));
  return mergeMembers(friends, chatPeople)
    .filter((member) => matchesQuery(member, needle))
    .map((member) => toConversation(member, { friendIds, last, unread, online, myId }))
    .sort(byLatestMessage);
}
