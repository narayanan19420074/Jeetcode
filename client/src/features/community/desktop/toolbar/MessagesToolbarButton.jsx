import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Badge, IconButton } from '@mui/material';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import { selectUnreadTotal } from '../../../friends/friendsSlice';
import MessagesDialog from './MessagesDialog';

// Messages icon at the right end of the toolbar. Its badge adds unread messages and friend requests waiting for an
// answer, because both are handled inside the Messages dialog.
export default function MessagesToolbarButton() {
  const [open, setOpen] = useState(false);
  const unreadMessages = useSelector(selectUnreadTotal);
  const pendingRequests = useSelector((state) => state.friends.incoming.length);
  return (
    <>
      <IconButton aria-label="Messages" onClick={() => setOpen(true)}>
        <Badge color="error" badgeContent={unreadMessages + pendingRequests}><ChatBubbleRoundedIcon /></Badge>
      </IconButton>
      <MessagesDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
