import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Badge, IconButton } from '@mui/material';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
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
        <Badge color="error" badgeContent={unreadMessages + pendingRequests}><ChatBubbleOutlineRoundedIcon /></Badge>
      </IconButton>
      <MessagesDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
