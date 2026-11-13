import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Dialog } from '@mui/material';
import { LibraryFont } from '../../../dashboard/components/libraryStyle';
import MessagesTopBar from './MessagesTopBar';
import ConversationList from './ConversationList';
import MessageChat from './MessageChat';
import useConversations from './useConversations';
import useMessageChat from './useMessageChat';

// Full-screen inbox opened from the messages button: a search field and the members the person chats with, with their
// latest message. Tapping a row opens the same chat as the Friends page. `initialChat` is a member whose chat opens at once.
// The dialog is a portal, so it wraps its content in LibraryFont again to get the page fonts and colours.
export default function MessagesScreen({ open, onClose, initialChat = null }) {
  const [query, setQuery] = useState('');
  const myId = useSelector((state) => state.auth.user?.id);
  const { conversations, loaded } = useConversations({ open, query });
  const chat = useMessageChat();
  const openChat = chat.open;
  useEffect(() => {
    if (initialChat) openChat(initialChat);
  }, [initialChat, openChat]);
  return (
    <Dialog fullScreen open={open} onClose={onClose} aria-label="Messages">
      <LibraryFont sx={{ flexGrow: 1, bgcolor: 'background.paper' }}>
        <MessagesTopBar onBack={onClose} query={query} onQueryChange={setQuery} />
        <ConversationList conversations={conversations} loaded={loaded} myId={myId} hasQuery={Boolean(query.trim())} onOpen={chat.open} />
      </LibraryFont>
      <MessageChat chat={chat} />
    </Dialog>
  );
}
