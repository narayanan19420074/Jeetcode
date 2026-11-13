import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Badge, IconButton } from '@mui/material';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { libIconBtnSx } from '../../../dashboard/components/libraryStyle';
import MessagesScreen from './MessagesScreen';

const totalUnread = (state) => Object.values(state.friends.unread).reduce((sum, count) => sum + count, 0);

// The messages icon of the phone top bar. It is drawn like the search field next to it (round, same soft fill, outline
// icon) and shows a dot while a friend's message is unread. It opens the messages screen.
export default function MessagesButton() {
  const [open, setOpen] = useState(false);
  const hasUnread = useSelector(totalUnread) > 0;
  return (
    <>
      <IconButton aria-label={hasUnread ? 'Messages, unread messages' : 'Messages'} onClick={() => setOpen(true)} sx={libIconBtnSx}>
        <Badge color="primary" variant="dot" invisible={!hasUnread}>
          <ChatBubbleOutlineRoundedIcon />
        </Badge>
      </IconButton>
      <MessagesScreen open={open} onClose={() => setOpen(false)} />
    </>
  );
}
