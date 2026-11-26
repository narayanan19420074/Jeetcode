import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { PersonAvatar } from '../friendsUi';
import { acceptFriendInvite } from '../friendsSlice';
import { useFriendAction } from '../desktop/useFriendAction';
import { FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';
import useInvitePreview from './useInvitePreview';

// The message for an invite that cannot be accepted (broken link, own link, already friends); null when it can be.
function blockedInviteMessage(preview) {
  if (preview.error) return preview.error;
  if (preview.isSelf) return 'This is your own invite link.';
  if (preview.relation === 'friends') return `You and @${preview.user.handle} are already friends.`;
  return null;
}

function InviteContent({ preview, blockedMessage }) {
  if (preview.loading) return <CircularProgress aria-label="Loading invite" />;
  if (blockedMessage) return <Typography>{blockedMessage}</Typography>;
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
      <PersonAvatar person={preview.user} size={SIZES.avatar.md} />
      <Typography><b>{preview.user.name}</b> (@{preview.user.handle}) invited you to be friends.</Typography>
    </Stack>
  );
}

// Opened by a shared friend invite link. Accepting makes both members friends at once, so the person sees who is asking
// before agreeing.
export default function FriendInviteDialog({ handle, onClose }) {
  const preview = useInvitePreview(handle);
  const { busy, run } = useFriendAction();
  const blockedMessage = preview.loading ? null : blockedInviteMessage(preview);
  const canAccept = !preview.loading && !blockedMessage;
  const accept = async () => {
    if (await run('invite', acceptFriendInvite(handle), `You and @${handle} are now friends`)) onClose();
  };
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: FONT_WEIGHTS.bold }}>Friend invite</DialogTitle>
      <DialogContent><InviteContent preview={preview} blockedMessage={blockedMessage} /></DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onClose} sx={{ textTransform: 'none' }}>{canAccept ? 'Not now' : 'Close'}</Button>
        {canAccept && <Button variant="contained" disableElevation disabled={busy === 'invite'} onClick={accept} sx={{ textTransform: 'none', fontWeight: FONT_WEIGHTS.bold }}>Accept</Button>}
      </DialogActions>
    </Dialog>
  );
}
