import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import OutlinedFlagRoundedIcon from '@mui/icons-material/OutlinedFlagRounded';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';

export const LANG_LABEL = { javascript: 'JavaScript', python: 'Python', cpp: 'C++' };

export function timeAgo(date) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

export function AuthorLine({ author, createdAt, editedAt, size = 22 }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
      <Avatar src={author?.avatarUrl || undefined} sx={{ width: size, height: size, fontSize: size * 0.5, fontWeight: 700 }}>
        {author?.name?.[0]?.toUpperCase()}
      </Avatar>
      <Typography variant="caption" noWrap sx={{ fontWeight: 600 }}>
        {author?.name || 'Unknown'}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap>
        · {timeAgo(createdAt)}
        {editedAt ? ' · edited' : ''}
      </Typography>
    </Stack>
  );
}

// Optimistic up/down vote control. Guests are sent to /login; authors can't
// vote on their own posts. Solutions pass allowDown={false} (upvote only).
export function VoteBar({ targetType, targetId, score, myVote, allowDown = true, isMine = false, onChange }) {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [state, setState] = useState({ score, myVote });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setState({ score, myVote });
  }, [score, myVote]);

  const cast = async (value) => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname } } });
    if (busy || isMine) return;
    const prev = state;
    const next = prev.myVote === value ? 0 : value;
    setState({ myVote: next, score: prev.score + next - prev.myVote });
    setBusy(true);
    setError('');
    try {
      const { data } = await communityApi.vote(targetType, targetId, next);
      setState(data.data);
      onChange?.(data.data.score, data.data.myVote);
    } catch (err) {
      setState(prev);
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const tip = isMine ? "You can't vote on your own post" : '';

  return (
    <Stack direction="row" alignItems="center" spacing={0.25}>
      <Tooltip title={tip || 'Upvote'}>
        <span>
          <IconButton size="small" aria-label="Upvote" aria-pressed={state.myVote === 1} onClick={() => cast(1)} disabled={isMine} color={state.myVote === 1 ? 'primary' : 'default'}>
            <KeyboardArrowUpRoundedIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center', fontWeight: 700 }} aria-live="polite">
        {state.score}
      </Typography>
      {allowDown && (
        <Tooltip title={tip || 'Downvote'}>
          <span>
            <IconButton size="small" aria-label="Downvote" aria-pressed={state.myVote === -1} onClick={() => cast(-1)} disabled={isMine} color={state.myVote === -1 ? 'error' : 'default'}>
              <KeyboardArrowDownRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
      )}
      {error && (
        <Typography variant="caption" color="error" sx={{ pl: 0.5 }}>
          {error}
        </Typography>
      )}
    </Stack>
  );
}

// ⋮ menu: Edit / Delete for the owner (admin can also delete), Report for others.
export function ItemMenu({ canEdit, canDelete, canReport, onEdit, onDelete, onReport }) {
  const [anchor, setAnchor] = useState(null);
  if (!canEdit && !canDelete && !canReport) return null;
  const close = () => setAnchor(null);
  const pick = (fn) => () => {
    close();
    fn?.();
  };

  return (
    <>
      <IconButton size="small" aria-label="More actions" onClick={(e) => setAnchor(e.currentTarget)}>
        <MoreVertRoundedIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
        {canEdit && (
          <MenuItem onClick={pick(onEdit)}>
            <ListItemIcon><EditRoundedIcon fontSize="small" /></ListItemIcon>
            Edit
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem onClick={pick(onDelete)} sx={{ color: 'error.main' }}>
            <ListItemIcon><DeleteOutlineRoundedIcon fontSize="small" color="error" /></ListItemIcon>
            Delete
          </MenuItem>
        )}
        {canReport && (
          <MenuItem onClick={pick(onReport)}>
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
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{text}</DialogContentText>
      </DialogContent>
      <DialogActions>
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
      <DialogTitle>Report</DialogTitle>
      <DialogContent>
        {done ? (
          <Alert severity="success">Thanks — our team will review this.</Alert>
        ) : (
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField select label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth>
              {REASONS.map((r) => (
                <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Details (optional)" value={note} onChange={(e) => setNote(e.target.value.slice(0, 300))} multiline minRows={2} fullWidth helperText={`${note.length}/300`} />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
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
