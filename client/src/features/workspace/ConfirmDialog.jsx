import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { WsButton } from './wsUi';

// "Replace your code?" style confirmation.
export default function ConfirmDialog({ open, title, text, confirmLabel, onCancel, onConfirm }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{text}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 0.5 }}>
        <WsButton variant="ghost" onClick={onCancel}>
          Cancel
        </WsButton>
        <WsButton variant="primary" onClick={onConfirm}>
          {confirmLabel}
        </WsButton>
      </DialogActions>
    </Dialog>
  );
}
