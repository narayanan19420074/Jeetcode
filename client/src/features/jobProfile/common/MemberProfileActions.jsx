import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack, useMediaQuery, useTheme } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import MemberChatDialog from './MemberChatDialog';
import { useFollowUser } from '../../community/common/usePostEngagement';
import { communityChatPathOf } from '../../community/common/communityChatLink';

// Follow and Message under the top card of another member's profile. On phones Message opens the Community messages
// screen with this member's chat, so a conversation always happens in one place; on desktop it opens the chat in a window.
export default function MemberProfileActions({ editor }) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(useTheme().breakpoints.down('md'));
  const [isChatOpen, setIsChatOpen] = useState(false);
  const memberId = editor.owner._id;
  const follow = useFollowUser(memberId, editor.isFollowing);
  const followLabel = follow.on ? 'Following' : 'Follow';
  const openMessage = () => (isMobile ? navigate(communityChatPathOf(memberId)) : setIsChatOpen(true));
  return (
    <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2 }}>
      <Button variant={follow.on ? 'outlined' : 'contained'} disableElevation fullWidth disabled={follow.busy} aria-pressed={follow.on} aria-label={`${followLabel} ${editor.owner.name}`} startIcon={follow.on ? <CheckRoundedIcon /> : <PersonAddAltRoundedIcon />} onClick={follow.toggle}>
        {followLabel}
      </Button>
      <Button variant="outlined" fullWidth aria-label={`Message ${editor.owner.name}`} startIcon={<ChatBubbleOutlineRoundedIcon />} onClick={openMessage}>
        Message
      </Button>
      {!isMobile && <MemberChatDialog owner={editor.owner} open={isChatOpen} onClose={() => setIsChatOpen(false)} />}
    </Stack>
  );
}
