import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { LIB_TRACKING, libTintBtnSx, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const actionSx = { height: SIZES.filterPillHeight, px: 2.5, fontSize: FONT_SIZES.title };

// Destructive action: the user confirms first, and the copy says exactly what they keep and when Pro ends.
export default function CancelSubscriptionDialog({ cancel }) {
  const pal = useLibraryPalette();
  const paperSx = { borderRadius: RADII_PX.card, bgcolor: pal.bg, backgroundImage: 'none', color: pal.text };
  return (
    <Dialog open={cancel.isOpen} onClose={cancel.close} fullWidth maxWidth="xs" slotProps={{ paper: { sx: paperSx } }}>
      <DialogTitle sx={{ fontSize: FONT_SIZES.heading, fontWeight: FONT_WEIGHTS.bold }}>Cancel subscription?</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>
          You keep Pro until the end of the period you have already paid for. After that your account moves to the Free plan.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button disableElevation disabled={cancel.isCancelling} onClick={cancel.close} sx={{ ...libTintBtnSx, ...actionSx }}>
          Keep plan
        </Button>
        <Button disableElevation disabled={cancel.isCancelling} onClick={cancel.confirm} color="error" variant="contained" sx={{ ...actionSx, borderRadius: RADII_PX.pill, fontWeight: FONT_WEIGHTS.medium, textTransform: 'none' }}>
          {cancel.isCancelling ? 'Cancelling…' : 'Cancel subscription'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
