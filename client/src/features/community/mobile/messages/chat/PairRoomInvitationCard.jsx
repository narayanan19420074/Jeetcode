import { Box, Button, Stack, Typography } from '@mui/material';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../../../app/design/designTokens';
import { LIB_ACCENT, LIB_TRACKING, libSmallBtnSx } from '../../../../dashboard/components/libraryStyle';
import useJoinPairRoom from './useJoinPairRoom';

const joinButtonSx = { ...libSmallBtnSx, mt: 1.5, bgcolor: LIB_ACCENT, color: COLOR_PALETTE.white, '&:hover': { bgcolor: `color-mix(in srgb, ${LIB_ACCENT} 85%, ${COLOR_PALETTE.black})` } };

// A pair room invitation inside the conversation. Either person can open the room from it while it is still running.
export default function PairRoomInvitationCard({ message, isMine, friend }) {
  const { join, isChecking } = useJoinPairRoom(message.roomId);
  const inviter = isMine ? 'You invited' : `${friend.name} invited you`;
  return (
    <Box sx={{ mt: 1, p: 2, maxWidth: SIZES.chatCardMaxWidth, borderRadius: RADII_PX.card, border: '1px solid var(--lib-border)', bgcolor: 'var(--lib-chip)' }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
        <LaptopMacRoundedIcon aria-hidden sx={{ fontSize: FONT_SIZES.displayLg, color: LIB_ACCENT, flexShrink: 0 }} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING, fontWeight: FONT_WEIGHTS.medium }}>Pair room invitation</Typography>
          <Typography noWrap sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>
            {message.roomTitle ? `${inviter} · ${message.roomTitle}` : inviter}
          </Typography>
        </Box>
      </Stack>
      <Button disableElevation variant="contained" disabled={isChecking} onClick={join} sx={joinButtonSx}>
        {isChecking ? 'Checking…' : isMine ? 'Rejoin room' : 'Join room'}
      </Button>
    </Box>
  );
}
