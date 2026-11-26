import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Badge, IconButton } from '@mui/material';
import { MessageOutlineIcon } from '../../common/feedActionIcons';
import MessagesScreen from './MessagesScreen';
import { selectInboxAttentionCount } from './selectInboxAttention';
import useChatLink from './useChatLink';
import useInboxLink from './useInboxLink';

// The messages icon of the phone top bar; it opens the messages screen and shows unread messages plus friend requests.
// A chat link (the Message button of a Job profile) opens the screen with that member's chat already open; an inbox link
// (a friend request notification) opens it on the requested tab.
export default function MessagesButton() {
  const [open, setOpen] = useState(false);
  const [linkedPerson, setLinkedPerson] = useState(null);
  const [requestedTab, setRequestedTab] = useState(null);
  const attentionCount = useSelector(selectInboxAttentionCount);
  const showLinkedChat = useCallback((person) => {
    setLinkedPerson(person);
    setOpen(true);
  }, []);
  const showInboxTab = useCallback((tab) => {
    setRequestedTab({ tab });
    setOpen(true);
  }, []);
  useChatLink(showLinkedChat);
  useInboxLink(showInboxTab);
  return (
    <>
      <IconButton aria-label={attentionCount ? `Messages, ${attentionCount} need attention` : 'Messages'} onClick={() => setOpen(true)} sx={{ color: 'var(--lib-text)' }}>
        <Badge color="error" badgeContent={attentionCount} max={99}><MessageOutlineIcon /></Badge>
      </IconButton>
      <MessagesScreen open={open} onClose={() => setOpen(false)} initialChat={linkedPerson} requestedTab={requestedTab} />
    </>
  );
}
