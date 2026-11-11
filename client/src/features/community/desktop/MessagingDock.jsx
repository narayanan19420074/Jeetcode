import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, ButtonBase, Paper, Stack, Typography } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { PersonAvatar } from '../../friends/friendsUi';
import { FONT_WEIGHTS, RADII_PX, SIZES, Z_INDEX } from '../../../app/design/designTokens';
import DockBody from './DockBody';

const dockSx = (open) => (theme) => ({
  position: 'fixed',
  right: theme.spacing(3),
  bottom: 0,
  zIndex: Z_INDEX.dock,
  width: SIZES.messagingDock.width,
  height: open ? SIZES.messagingDock.height : 'auto',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: `${RADII_PX.card} ${RADII_PX.card} 0 0`,
  bgcolor: 'background.paper',
});

function DockHeader({ user, unread, open, onToggle }) {
  const Chevron = open ? KeyboardArrowDownRoundedIcon : KeyboardArrowUpRoundedIcon;
  return (
    <ButtonBase onClick={onToggle} aria-expanded={open} aria-label="Messaging" sx={{ width: SIZES.fill, justifyContent: 'flex-start', gap: 1.5, px: 2, py: 1.5, fontFamily: 'inherit' }}>
      <PersonAvatar person={user} size={SIZES.avatar.sm} online />
      <Typography sx={{ flex: 1, textAlign: 'left', fontWeight: FONT_WEIGHTS.semibold }}>Messaging</Typography>
      {unread > 0 && <Box component="span" aria-label={`${unread} unread`} sx={{ px: 0.75, borderRadius: RADII_PX.pill, bgcolor: 'error.main', color: 'error.contrastText', typography: 'caption', fontWeight: FONT_WEIGHTS.bold }}>{unread}</Box>}
      <Chevron />
    </ButtonBase>
  );
}

// Chat dock at the bottom right, like LinkedIn's Messaging: a bar that opens upwards into your conversations, and a
// tap on one opens that friend's chat inside the dock. Uses the real friend chat; signed-out visitors do not see it.
export default function MessagingDock() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const unread = useSelector((state) => Object.values(state.friends.unread).reduce((total, n) => total + n, 0));
  const [open, setOpen] = useState(false);
  if (!isAuthenticated) return null;

  return (
    <Paper variant="outlined" component="aside" aria-label="Messaging" sx={dockSx(open)}>
      <DockHeader user={user} unread={unread} open={open} onToggle={() => setOpen((current) => !current)} />
      {open && <Stack sx={{ flex: 1, minHeight: SIZES.flexShrinkMinHeight, borderTop: '1px solid', borderColor: 'divider' }}><DockBody /></Stack>}
    </Paper>
  );
}
