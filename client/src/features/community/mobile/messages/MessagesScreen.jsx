import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Dialog } from '@mui/material';
import { LibraryFont } from '../../../dashboard/components/libraryStyle';
import CategoryTabs from '../../common/CategoryTabs';
import MessagesTopBar from './MessagesTopBar';
import ConversationList from './ConversationList';
import MessageChat from './MessageChat';
import useConversations from './useConversations';
import useInboxTabs from './useInboxTabs';
import useMessageChat from './useMessageChat';

// Full-screen inbox opened from the messages button: a search field, the Primary / General / Requests tabs, the friend
// requests (Requests tab) and the members the person chats with, with their latest message. `requestedTab` ({ tab })
// opens a given tab. Tapping a row opens the chat. `initialChat` is a member whose chat opens at once.
// The dialog is a portal, so it wraps its content in LibraryFont again to get the page fonts and colours.
export default function MessagesScreen({ open, onClose, initialChat = null, requestedTab = null }) {
  const [query, setQuery] = useState('');
  const myId = useSelector((state) => state.auth.user?.id);
  const { conversations, friendRequests, loaded } = useConversations({ open, query });
  const isSearching = Boolean(query.trim());
  const inbox = useInboxTabs({ conversations, friendRequests, isSearching, requestedTab });
  const chat = useMessageChat();
  const openChat = chat.open;
  useEffect(() => {
    if (initialChat) openChat(initialChat);
  }, [initialChat, openChat]);
  return (
    <Dialog fullScreen open={open} onClose={onClose} aria-label="Messages">
      <LibraryFont sx={{ flexGrow: 1, bgcolor: 'background.paper' }}>
        <MessagesTopBar onBack={onClose} query={query} onQueryChange={setQuery} />
        {!isSearching && <Box sx={{ px: 2, py: 1 }}><CategoryTabs value={inbox.tab} onChange={inbox.setTab} options={inbox.tabOptions} /></Box>}
        <ConversationList conversations={inbox.visibleConversations} friendRequests={inbox.visibleFriendRequests} loaded={loaded} myId={myId} tab={inbox.tab} hasQuery={isSearching} onOpen={chat.open} />
      </LibraryFont>
      <MessageChat chat={chat} />
    </Dialog>
  );
}
