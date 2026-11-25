import { useMemo, useState } from 'react';
import { INBOX_TAB, INBOX_TAB_OPTIONS } from './inboxTabs';

const countUnreadConversations = (conversations, tab) => conversations.filter((conversation) => conversation.tab === tab && conversation.unread > 0).length;

// The selected inbox tab, the conversations to list and the unread count shown on each tab. While the member is
// searching, every tab is searched at once so a person is found wherever the conversation lives.
export default function useInboxTabs({ conversations, isSearching }) {
  const [tab, setTab] = useState(INBOX_TAB.primary);

  const visibleConversations = useMemo(
    () => (isSearching ? conversations : conversations.filter((conversation) => conversation.tab === tab)),
    [conversations, isSearching, tab]
  );
  const tabOptions = useMemo(
    () => INBOX_TAB_OPTIONS.map((option) => ({ ...option, count: countUnreadConversations(conversations, option.value) })),
    [conversations]
  );

  return { tab, setTab, visibleConversations, tabOptions };
}
