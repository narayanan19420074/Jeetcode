import { useState } from 'react';
import { IconButton } from '@mui/material';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import MessagesScreen from './MessagesScreen';

// The messages icon of the phone top bar; it opens the messages screen.
export default function MessagesButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton aria-label="Messages" onClick={() => setOpen(true)} sx={{ color: 'var(--lib-text)' }}>
        <ChatBubbleRoundedIcon />
      </IconButton>
      <MessagesScreen open={open} onClose={() => setOpen(false)} />
    </>
  );
}
