import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import HeartBrokenOutlinedIcon from '@mui/icons-material/HeartBrokenOutlined';
import HeartBrokenRoundedIcon from '@mui/icons-material/HeartBrokenRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import OutlinedFlagRoundedIcon from '@mui/icons-material/OutlinedFlagRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';
import { LANG_LABEL, LANG_COLOR } from './Markdown';

export { LANG_LABEL, LANG_COLOR };

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

export const clamp = (lines) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

// ---------------------------------------------------------------- identity

const HUES = [210, 160, 35, 280, 340, 190, 12, 250];
function hueFor(name = '') {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return HUES[h % HUES.length];
}

// Photo when the user has one, otherwise a tinted initial (hue derived from the name).
export function UserAvatar({ user, size = 40 }) {
  const hue = hueFor(user?.name);
  return (
    <Avatar
      src={user?.avatarUrl || undefined}
      alt={user?.name || ''}
      sx={(t) => ({
        width: size,
        height: size,
        fontSize: size * 0.42,
        fontWeight: 700,
        color: t.palette.mode === 'dark' ? `hsl(${hue} 80% 85%)` : `hsl(${hue} 60% 28%)`,
        bgcolor: t.palette.mode === 'dark' ? `hsl(${hue} 35% 26%)` : `hsl(${hue} 70% 90%)`,
        border: '1px solid',
        borderColor: 'divider',
      })}
    >
      {user?.name?.[0]?.toUpperCase()}
    </Avatar>
  );
}

// Instagram-style post header: avatar, bold name, muted time line, slot on the right.
export function AuthorHeader({ author, createdAt, editedAt, isMine, size = 40, right }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
      <UserAvatar user={author} size={size} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>
            {author?.name || 'Unknown'}
          </Typography>
          {isMine && <Chip size="small" label="You" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }} />}
        </Stack>
        <Typography noWrap color="text.secondary" sx={{ fontSize: '0.8rem' }}>
          {timeAgo(createdAt)}
          {editedAt ? ' · edited' : ''}
        </Typography>
      </Box>
      {right}
    </Stack>
  );
}

// ------------------------------------------------------------------- chips

export function LangChip({ language }) {
  return (
    <Chip
      size="small"
      label={LANG_LABEL[language] || language}
      icon={<FiberManualRecordRoundedIcon style={{ color: LANG_COLOR[language] }} sx={{ fontSize: '12px !important' }} />}
      sx={{ height: 28, fontWeight: 600, bgcolor: 'action.hover' }}
    />
  );
}

export function MetricChip({ icon, label }) {
  return <Chip size="small" icon={icon} label={label} sx={{ height: 28, fontWeight: 600, bgcolor: 'action.hover', '& .MuiChip-icon': { fontSize: 16 } }} />;
}

export function AcceptedBadge() {
  return (
    <Chip
      size="small"
      icon={<CheckCircleRoundedIcon />}
      label="Accepted"
      sx={(t) => ({ height: 26, fontWeight: 700, color: 'success.main', bgcolor: alpha(t.palette.success.main, 0.12), '& .MuiChip-icon': { color: 'success.main', fontSize: 16 } })}
    />
  );
}

// ------------------------------------------------------------------- votes

// Instagram-style vote control: ♥ = upvote (red + pop animation when liked),
// 💔 = downvote. Optimistic; guests are sent to /login; authors can't vote on
// their own posts. variant 'pill' = flat action row (feed posts), 'column' =
// compact stack beside a comment. Solutions pass allowDown={false} (like only).
const LIKE_RED = '#ff3040';
const pop = keyframes`
  0% { transform: scale(1); }
  35% { transform: scale(1.35); }
  70% { transform: scale(0.92); }
  100% { transform: scale(1); }
`;

export function VoteBar({ targetType, targetId, score, myVote, allowDown = true, isMine = false, variant = 'pill', onChange }) {
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
  const column = variant === 'column';
  const btn = column ? 28 : 40;
  const icon = column ? 19 : 26;
  const liked = state.myVote === 1;
  const disliked = state.myVote === -1;

  const likeBtn = (
    <Tooltip title={tip || (liked ? 'Unlike' : 'Like')}>
      <span>
        <IconButton
          aria-label="Like"
          aria-pressed={liked}
          onClick={() => cast(1)}
          disabled={isMine}
          sx={{ width: btn, height: btn, color: liked ? LIKE_RED : 'text.primary' }}
        >
          {liked ? (
            <FavoriteRoundedIcon key="on" sx={{ fontSize: icon, animation: `${pop} .35s ease-out` }} />
          ) : (
            <FavoriteBorderRoundedIcon key="off" sx={{ fontSize: icon }} />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );

  const count = (
    <Typography
      aria-live="polite"
      sx={{
        minWidth: column ? 0 : 16,
        textAlign: 'center',
        fontWeight: 600,
        fontSize: column ? '0.75rem' : '0.95rem',
        lineHeight: 1,
        color: liked ? LIKE_RED : 'text.primary',
      }}
    >
      {state.score}
    </Typography>
  );

  const dislikeBtn = allowDown && (
    <Tooltip title={tip || (disliked ? 'Remove dislike' : 'Dislike')}>
      <span>
        <IconButton
          aria-label="Dislike"
          aria-pressed={disliked}
          onClick={() => cast(-1)}
          disabled={isMine}
          sx={{ width: btn, height: btn, color: disliked ? 'text.primary' : 'text.secondary' }}
        >
          {disliked ? <HeartBrokenRoundedIcon sx={{ fontSize: icon }} /> : <HeartBrokenOutlinedIcon sx={{ fontSize: icon }} />}
        </IconButton>
      </span>
    </Tooltip>
  );

  return (
    <Box>
      {column ? (
        <Stack alignItems="center" spacing={0.25}>
          {likeBtn}
          {count}
          {dislikeBtn}
        </Stack>
      ) : (
        <Stack direction="row" alignItems="center" sx={{ gap: 0.25 }}>
          {likeBtn}
          {count}
          {dislikeBtn}
        </Stack>
      )}
      {error && (
        <Typography color="error" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

// Icon + count button for the action row (comments etc.).
export function ActionButton({ icon, count, label, onClick }) {
  return (
    <Button
      color="inherit"
      aria-label={label}
      onClick={onClick}
      startIcon={icon}
      sx={{ height: 40, px: 1.25, minWidth: 0, color: 'text.primary', fontWeight: 600, fontSize: '0.95rem', '& .MuiButton-startIcon': { mr: 0.75, '& svg': { fontSize: 25 } } }}
    >
      {count}
    </Button>
  );
}

// ------------------------------------------------------------ menus/dialogs

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
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
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
      <DialogTitle sx={{ fontWeight: 700 }}>Report</DialogTitle>
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

// --------------------------------------------------------- feed furniture

// Pill segmented control (sort). Scrolls sideways instead of wrapping.
export function SegmentedTabs({ value, onChange, options }) {
  return (
    <Stack
      direction="row"
      role="tablist"
      spacing={0.5}
      sx={{ p: 0.5, borderRadius: 999, bgcolor: 'action.hover', width: 'fit-content', maxWidth: '100%', overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Button
            key={o.value}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            startIcon={o.icon}
            sx={(t) => ({
              height: 40,
              px: 1.75,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              borderRadius: 999,
              fontWeight: 700,
              color: on ? 'primary.main' : 'text.secondary',
              bgcolor: on ? 'background.paper' : 'transparent',
              boxShadow: on ? `0 1px 4px ${alpha(t.palette.primary.main, 0.28)}` : 'none',
              '& .MuiButton-startIcon svg': { fontSize: 20 },
              '&:hover': { bgcolor: on ? 'background.paper' : 'action.hover' },
            })}
          >
            {o.label}
          </Button>
        );
      })}
    </Stack>
  );
}

// Horizontal scrolling filter chips (language filter).
export function FilterChips({ value, onChange, options }) {
  return (
    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.25, '&::-webkit-scrollbar': { display: 'none' } }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Chip
            key={o.value || 'all'}
            clickable
            onClick={() => onChange(o.value)}
            label={o.label}
            color={on ? 'primary' : 'default'}
            variant={on ? 'filled' : 'outlined'}
            sx={{ height: 36, fontWeight: 600, flexShrink: 0, fontSize: '0.875rem' }}
          />
        );
      })}
    </Stack>
  );
}

// "What's on your mind?" bar at the top of a feed.
export function ComposerPrompt({ icon, placeholder, onClick }) {
  const user = useSelector((s) => s.auth.user);
  return (
    <ButtonBase
      onClick={onClick}
      sx={{ width: '100%', justifyContent: 'flex-start', gap: 1.25, px: 1.25, py: 1, minHeight: 60, border: '1px solid', borderColor: 'divider', borderRadius: 999, textAlign: 'left' }}
    >
      {user && <UserAvatar user={user} size={38} />}
      <Typography color="text.secondary" noWrap sx={{ flex: 1, fontSize: '0.95rem', pl: user ? 0 : 1 }}>
        {placeholder}
      </Typography>
      <Box
        sx={(t) => ({ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0, color: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.12), '& svg': { fontSize: 22 } })}
      >
        {icon}
      </Box>
    </ButtonBase>
  );
}

export function EmptyBlock({ icon, title, text }) {
  return (
    <Stack sx={{ alignItems: 'center', textAlign: 'center', py: 6, px: 2, gap: 1.5 }}>
      <Box
        sx={(t) => ({ width: 72, height: 72, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: alpha(t.palette.primary.main, 0.12), color: 'primary.main', '& svg': { fontSize: 34 } })}
      >
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>{title}</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 320, fontSize: '0.92rem' }}>
        {text}
      </Typography>
    </Stack>
  );
}

// Skeleton shaped like the real feed posts (avatar, text, optional code box, action row).
export function FeedSkeleton({ count = 3, withCode = false }) {
  return (
    <Stack divider={<Divider flexItem />}>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="38%" height={20} />
              <Skeleton width="22%" height={14} />
            </Box>
          </Stack>
          <Skeleton width="78%" height={28} sx={{ mt: 1.5 }} />
          <Skeleton width="95%" height={20} />
          {withCode && <Skeleton variant="rounded" height={120} sx={{ mt: 1.5, borderRadius: 3 }} />}
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Skeleton variant="rounded" width={104} height={42} sx={{ borderRadius: 999 }} />
            <Skeleton variant="rounded" width={64} height={42} sx={{ borderRadius: 999 }} />
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
