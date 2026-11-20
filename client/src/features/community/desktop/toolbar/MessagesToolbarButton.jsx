import { useSelector } from 'react-redux';
import { Badge, IconButton } from '@mui/material';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { selectUnreadTotal } from '../../../friends/friendsSlice';

// Messages icon at the right end of the toolbar. It opens Messages in the page itself, and stays highlighted while
// Messages is open. Its badge adds unread messages and friend requests waiting for an answer, because both are
// handled inside Messages.
export default function MessagesToolbarButton({ isOpen, onToggle }) {
  const unreadMessages = useSelector(selectUnreadTotal);
  const pendingRequests = useSelector((state) => state.friends.incoming.length);
  return (
    <IconButton aria-label="Messages" aria-pressed={isOpen} onClick={onToggle} sx={{ bgcolor: isOpen ? 'action.selected' : 'transparent' }}>
      <Badge color="error" badgeContent={unreadMessages + pendingRequests}><ChatBubbleOutlineRoundedIcon /></Badge>
    </IconButton>
  );
}
