import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Box, ButtonBase, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';
import { LIB_FONT, LIB_TRACKING, libBackBtnSx, libIconBtnSx } from '../../dashboard/components/libraryStyle';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { PersonAvatar } from '../friendsUi';
import { useState } from 'react';
import { LIB_SUCCESS } from './chatShared';
import { TypingDots } from './ChatBubbles';

// Header: back, friend (tap = profile), Code together, and a menu for the rest.
export function LibHeader({ friend, online, typing, status, profileOpen, onBack, onToggleProfile, onCodeTogether, onNudge, nudging, onRemove }) {
  const [anchor, setAnchor] = useState(null);
  const close = () => setAnchor(null);
  const itemSx = { minHeight: 48, fontSize: FONT_SIZES.title, fontFamily: LIB_FONT, letterSpacing: LIB_TRACKING };
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 1, flexShrink: 0, borderBottom: '1px solid var(--lib-divider)' }}>
      <IconButton onClick={onBack} aria-label={profileOpen ? 'Back to chat' : 'Back to friends'} sx={libBackBtnSx}>
        <ArrowBackRoundedIcon />
      </IconButton>
      <ButtonBase onClick={onToggleProfile} aria-label={`${profileOpen ? 'Hide' : 'View'} profile of ${friend.name}`} aria-pressed={profileOpen} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5, flex: 1, minWidth: 0, textAlign: 'left', fontFamily: 'inherit', color: 'inherit', ml: -0.5 }}>
        <PersonAvatar person={friend} size={40} online={online} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>{friend.name}</Typography>
          <Typography noWrap sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: typing || status.live ? LIB_SUCCESS : 'var(--lib-muted)' }}>
            {typing ? <>typing<TypingDots /></> : status.text}
          </Typography>
        </Box>
      </ButtonBase>
      <IconButton onClick={onCodeTogether} aria-label="Code together" sx={libIconBtnSx}>
        <LaptopMacRoundedIcon />
      </IconButton>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="More options" aria-haspopup="menu" sx={libIconBtnSx}>
        <MoreVertRoundedIcon />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close} slotProps={{ paper: { sx: { borderRadius: RADII_PX.card, minWidth: 220 } } }}>
        <MenuItem onClick={() => { close(); onToggleProfile(); }} sx={itemSx}>{profileOpen ? 'Back to chat' : 'View profile'}</MenuItem>
        {onNudge && (
          <MenuItem disabled={nudging} onClick={() => { close(); onNudge(); }} sx={itemSx}>Nudge about streak</MenuItem>
        )}
        <MenuItem onClick={() => { close(); onRemove(); }} sx={{ ...itemSx, color: 'error.main' }}>Remove friend</MenuItem>
      </Menu>
    </Stack>
  );
}
