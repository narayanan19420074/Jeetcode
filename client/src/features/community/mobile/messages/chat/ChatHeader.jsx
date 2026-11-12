import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../../../app/design/designTokens';
import { LIB_FONT, LIB_TRACKING, libBackBtnSx, libIconBtnSx } from '../../../../dashboard/components/libraryStyle';
import { statusInfo } from '../../../../friends/friendsUi';
import { LIB_SUCCESS } from '../../../../friends/chat/chatShared';

const menuItemSx = { minHeight: 48, fontSize: FONT_SIZES.title, fontFamily: LIB_FONT, letterSpacing: LIB_TRACKING };

function StatusLine({ friend, isTyping }) {
  const isOnline = useSelector((state) => Boolean(state.friends.online[friend.userId]));
  const status = statusInfo(friend, isOnline);
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      {isOnline && <Box component="span" aria-hidden sx={{ width: SIZES.presenceDot, height: SIZES.presenceDot, borderRadius: RADII_PX.circle, bgcolor: LIB_SUCCESS }} />}
      <Typography noWrap sx={{ fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>
        {isTyping ? 'Typing…' : isOnline ? 'Active now' : status.text}
      </Typography>
    </Stack>
  );
}

function ChatMenu({ anchor, onClose, actions }) {
  const run = (action) => () => { onClose(); action(); };
  return (
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={onClose} slotProps={{ paper: { sx: { borderRadius: RADII_PX.card, minWidth: 220 } } }}>
      <MenuItem onClick={run(actions.openProfile)} sx={menuItemSx}>View profile</MenuItem>
      <MenuItem onClick={run(actions.invitePairRoom)} sx={menuItemSx}>Invite to pair room</MenuItem>
      <MenuItem onClick={run(actions.removeFriend)} sx={{ ...menuItemSx, color: 'error.main' }}>Remove friend</MenuItem>
    </Menu>
  );
}

// Back arrow, the friend's name with "Active now" under it, and the "..." menu with the profile, pair room and remove actions.
export default function ChatHeader({ friend, isTyping, onBack, actions }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 1, flexShrink: 0, borderBottom: '1px solid var(--lib-divider)' }}>
      <IconButton onClick={onBack} aria-label="Back to messages" sx={libBackBtnSx}><ArrowBackRoundedIcon /></IconButton>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.subheading, lineHeight: '24px', letterSpacing: LIB_TRACKING, fontWeight: FONT_WEIGHTS.bold }}>{friend.name}</Typography>
        <StatusLine friend={friend} isTyping={isTyping} />
      </Box>
      <IconButton onClick={(event) => setMenuAnchor(event.currentTarget)} aria-label="More options" aria-haspopup="menu" sx={libIconBtnSx}><MoreVertRoundedIcon /></IconButton>
      <ChatMenu anchor={menuAnchor} onClose={() => setMenuAnchor(null)} actions={actions} />
    </Stack>
  );
}
