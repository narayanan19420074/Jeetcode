import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { FONT_WEIGHTS } from '../../../app/design/designTokens';

// `confirm` is 'delete' | 'leave' | { remove: member } | null.
function confirmCopy(confirm) {
  if (confirm === 'delete') return { title: 'Delete plan?', text: 'This removes the plan for everyone. Questions you solved stay solved.', action: 'Delete' };
  if (confirm === 'leave') return { title: 'Leave plan?', text: 'You will be removed from this plan. You can rejoin with the invite link.', action: 'Leave' };
  return { title: 'Remove member?', text: confirm ? `${confirm.remove.name} will be removed from this plan.` : '', action: 'Remove' };
}

export default function PlanConfirmDialog({ confirm, busy, onClose, onConfirm }) {
  const { title, text, action } = confirmCopy(confirm);
  return (
    <Dialog open={Boolean(confirm)} onClose={() => !busy && onClose()} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: FONT_WEIGHTS.bold }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{text}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button color="error" variant="contained" disableElevation onClick={onConfirm} disabled={busy} sx={{ fontWeight: FONT_WEIGHTS.bold }}>
          {action}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
