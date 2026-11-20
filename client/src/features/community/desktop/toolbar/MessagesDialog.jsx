import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Dialog, IconButton, Stack, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FriendsView from '../../../friends/FriendsView';
import { FONT_WEIGHTS, SIZES } from '../../../../app/design/designTokens';

const { messagesDialog } = SIZES.communityToolbar;
const paperSx = { m: 0, p: 2, overflow: 'hidden', width: messagesDialog.width, maxWidth: messagesDialog.maxWidth, height: messagesDialog.height };
const ignoreInviteLink = () => {};

// The Friends page in a dialog: friends, friend requests, sent requests and find players on the left, and the chat
// with the selected friend on the right. It is the same component as the Friends page, so both always agree.
export default function MessagesDialog({ open, onClose }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const openLeaderboard = () => {
    onClose();
    navigate('/dashboard?view=leaderboard&scope=friends');
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} aria-label="Messages" slotProps={{ paper: { sx: paperSx } }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography component="h2" variant="h6" sx={{ fontWeight: FONT_WEIGHTS.bold }}>Messages</Typography>
        <IconButton aria-label="Close messages" onClick={onClose}><CloseRoundedIcon /></IconButton>
      </Stack>
      <FriendsView isAuthenticated={isAuthenticated} user={user} inviteHandle={null} onClearInvite={ignoreInviteLink} onOpenLeaderboard={openLeaderboard} />
    </Dialog>
  );
}
