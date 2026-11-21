import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack, useMediaQuery, useTheme } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import MemberActionsMenu from './MemberActionsMenu';
import MemberChatDialog from './MemberChatDialog';
import { useFollowUser } from '../../community/common/usePostEngagement';
import { communityChatPathOf } from '../../community/common/communityChatLink';
import { FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';

const actionButtonSx = { borderRadius: RADII_PX.pill, textTransform: 'none', fontWeight: FONT_WEIGHTS.semibold };

// Follow, Message and the "..." menu under the top card of another member's profile. On phones Message opens the
// Community messages screen with this member's chat, so a conversation always happens in one place; on desktop it opens
// the chat in a window. The row is hidden when printing the profile.
export default function MemberProfileActions({ editor }) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(useTheme().breakpoints.down('md'));
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { owner } = editor;
  const follow = useFollowUser(owner._id, editor.isFollowing);
  const followLabel = follow.on ? 'Following' : 'Follow';
  const openMessage = () => (isMobile ? navigate(communityChatPathOf(owner._id)) : setIsChatOpen(true));
  return (
    <Stack data-print-hide direction="row" spacing={1} sx={{ px: 2, pb: 2, alignItems: 'center' }}>
      <Button variant={follow.on ? 'outlined' : 'contained'} disableElevation fullWidth={isMobile} disabled={follow.busy} aria-pressed={follow.on} aria-label={`${followLabel} ${owner.name}`} startIcon={follow.on ? <CheckRoundedIcon /> : <PersonAddAltRoundedIcon />} onClick={follow.toggle} sx={actionButtonSx}>
        {followLabel}
      </Button>
      <Button variant="outlined" fullWidth={isMobile} aria-label={`Message ${owner.name}`} startIcon={<ChatBubbleOutlineRoundedIcon />} onClick={openMessage} sx={actionButtonSx}>
        Message
      </Button>
      <MemberActionsMenu owner={owner} followerCount={editor.followerCount} />
      {!isMobile && <MemberChatDialog owner={owner} open={isChatOpen} onClose={() => setIsChatOpen(false)} />}
    </Stack>
  );
}
