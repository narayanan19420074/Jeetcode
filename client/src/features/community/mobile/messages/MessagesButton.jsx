import { useCallback, useState } from 'react';
import { IconButton } from '@mui/material';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import MessagesScreen from './MessagesScreen';
import useChatLink from './useChatLink';

// The messages icon of the phone top bar; it opens the messages screen. A chat link (the Message button of a Job
// profile) opens the screen with that member's chat already open.
export default function MessagesButton() {
  const [open, setOpen] = useState(false);
  const [linkedPerson, setLinkedPerson] = useState(null);
  const showLinkedChat = useCallback((person) => {
    setLinkedPerson(person);
    setOpen(true);
  }, []);
  useChatLink(showLinkedChat);
  return (
    <>
      <IconButton aria-label="Messages" onClick={() => setOpen(true)} sx={{ color: 'var(--lib-text)' }}>
        <ChatBubbleRoundedIcon />
      </IconButton>
      <MessagesScreen open={open} onClose={() => setOpen(false)} initialChat={linkedPerson} />
    </>
  );
}
