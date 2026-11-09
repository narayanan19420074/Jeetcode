import { Box, Button, Typography } from '@mui/material';
import { LIB_TRACKING, libPanelSx, libSolidBtnSx, libTintBtnSx } from '../../dashboard/components/libraryStyle';
import { fmtRange } from '../planUtils';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';
import { MUTED } from './mobileStyle';

// Inline card shown when the learner opens a plan invite link: join it, or dismiss it.
export default function MobileInviteCard({ invite, joining, onAccept, onDismiss }) {
  return (
    <Box sx={{ ...libPanelSx, p: 2, mt: 3 }}>
      {invite.error ? (
        <>
          <Typography color="error" sx={{ fontSize: FONT_SIZES.title }}>
            {invite.error}
          </Typography>
          <Button onClick={onDismiss} fullWidth disableElevation variant="contained" sx={{ ...libTintBtnSx, bgcolor: 'var(--lib-bg)', mt: 1.5 }}>
            Dismiss
          </Button>
        </>
      ) : (
        <>
          <Typography sx={{ fontSize: FONT_SIZES.body, color: MUTED, letterSpacing: LIB_TRACKING }}>{invite.owner ? `@${invite.owner.handle} invited you to` : 'You are invited to'}</Typography>
          <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.subheading, lineHeight: '24px', overflowWrap: 'anywhere' }}>{invite.title}</Typography>
          <Typography sx={{ fontSize: FONT_SIZES.body, color: MUTED, letterSpacing: LIB_TRACKING, mt: 0.5 }}>
            {invite.taskCount} questions, {fmtRange(invite.startDate, invite.endDate)}, {invite.memberCount} member{invite.memberCount === 1 ? '' : 's'}
          </Typography>
          {invite.isFull ? (
            <Typography sx={{ mt: 1.5, fontWeight: FONT_WEIGHTS.bold, color: 'warning.main' }}>This plan is full</Typography>
          ) : (
            <Button onClick={onAccept} disabled={joining} fullWidth disableElevation variant="contained" sx={{ ...libSolidBtnSx, mt: 1.5 }}>
              {joining ? 'Joining…' : 'Join plan'}
            </Button>
          )}
          <Button onClick={onDismiss} disabled={joining} fullWidth sx={{ ...libTintBtnSx, bgcolor: 'transparent', mt: 1 }}>
            Not now
          </Button>
        </>
      )}
    </Box>
  );
}
