import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, ListItemIcon, Menu, MenuItem, Stack, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import OutlinedFlagRoundedIcon from '@mui/icons-material/OutlinedFlagRounded';
import { communityApi } from '../../../../api/communityApi';
import { extractErrorMessage } from '../../../../api/apiClient';
import { FONT_WEIGHTS } from '../../../../app/design/designTokens';

// ⋯ menu: Edit / Delete for the owner (admin can also delete), Report for others.
export function ItemMenu({ canEdit, canDelete, canReport, onEdit, onDelete, onReport, size = 'medium' }) {
  const [anchor, setAnchor] = useState(null);
  if (!canEdit && !canDelete && !canReport) return null;
  const close = () => setAnchor(null);
  const pick = (fn) => () => {
    close();
    fn?.();
  };

  return (
    <>
      <IconButton size={size} aria-label="More actions" onClick={(e) => setAnchor(e.currentTarget)}>
        <MoreHorizRoundedIcon />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
        {canEdit && (
          <MenuItem onClick={pick(onEdit)} sx={{ minHeight: 46 }}>
            <ListItemIcon><EditRoundedIcon fontSize="small" /></ListItemIcon>
            Edit
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem onClick={pick(onDelete)} sx={{ minHeight: 46, color: 'error.main' }}>
            <ListItemIcon><DeleteOutlineRoundedIcon fontSize="small" color="error" /></ListItemIcon>
            Delete
          </MenuItem>
        )}
        {canReport && (
          <MenuItem onClick={pick(onReport)} sx={{ minHeight: 46 }}>
            <ListItemIcon><OutlinedFlagRoundedIcon fontSize="small" /></ListItemIcon>
            Report
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

export function ConfirmDialog({ open, title, text, confirmLabel = 'Delete', loading, onConfirm, onClose }) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: FONT_WEIGHTS.bold }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{text}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button color="error" variant="contained" disableElevation onClick={onConfirm} disabled={loading}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const REASONS = [
  { id: 'spam', label: 'Spam or advertising' },
  { id: 'abusive', label: 'Abusive or harassing' },
  { id: 'off-topic', label: 'Off-topic' },
  { id: 'wrong-solution', label: 'Wrong or misleading solution' },
  { id: 'other', label: 'Something else' },
];

export function ReportDialog({ open, onClose, targetType, targetId }) {
  const [reason, setReason] = useState('spam');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('spam');
      setNote('');
      setError('');
      setDone(false);
    }
  }, [open]);

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      await communityApi.report({ targetType, targetId, reason, note });
      setDone(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: FONT_WEIGHTS.bold }}>Report</DialogTitle>
      <DialogContent>
        {done ? (
          <Alert severity="success">Thanks — our team will review this.</Alert>
        ) : (
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField select label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth>
              {REASONS.map((r) => (
                <MenuItem key={r.id} value={r.id} sx={{ minHeight: 46 }}>{r.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Details (optional)" value={note} onChange={(e) => setNote(e.target.value.slice(0, 300))} multiline minRows={2} fullWidth helperText={`${note.length}/300`} />
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{done ? 'Close' : 'Cancel'}</Button>
        {!done && (
          <Button variant="contained" disableElevation onClick={submit} disabled={saving}>
            Submit report
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
