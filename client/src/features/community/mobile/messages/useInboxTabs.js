import { useEffect, useMemo, useState } from 'react';
import { INBOX_TAB, INBOX_TAB_OPTIONS } from './inboxTabs';

const countUnreadConversations = (conversations, tab) => conversations.filter((conversation) => conversation.tab === tab && conversation.unread > 0).length;

// Friend requests are answered in the Requests tab, so they count towards that tab's badge.
const attentionCountOf = (conversations, friendRequests, tab) => countUnreadConversations(conversations, tab) + (tab === INBOX_TAB.requests ? friendRequests.length : 0);

// The selected inbox tab, what to list in it and the badge count of each tab. While the member is searching, every tab
// is searched at once so a person is found wherever the conversation lives. `requestedTab` ({ tab }) switches the tab
// when a link asks for one.
export default function useInboxTabs({ conversations, friendRequests, isSearching, requestedTab }) {
  const [tab, setTab] = useState(INBOX_TAB.primary);
  useEffect(() => {
    if (requestedTab) setTab(requestedTab.tab);
  }, [requestedTab]);

  const visibleConversations = useMemo(
    () => (isSearching ? conversations : conversations.filter((conversation) => conversation.tab === tab)),
    [conversations, isSearching, tab]
  );
  const visibleFriendRequests = !isSearching && tab === INBOX_TAB.requests ? friendRequests : [];
  const tabOptions = useMemo(
    () => INBOX_TAB_OPTIONS.map((option) => ({ ...option, count: attentionCountOf(conversations, friendRequests, option.value) })),
    [conversations, friendRequests]
  );

  return { tab, setTab, visibleConversations, visibleFriendRequests, tabOptions };
}
