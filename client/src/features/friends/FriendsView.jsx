import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Alert, Avatar, Badge, Box, Button, ButtonBase, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  IconButton, InputAdornment, ListItemIcon, Menu, MenuItem, Skeleton, Stack, TextField, Tooltip, Typography, alpha,
} from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import MarkunreadRoundedIcon from '@mui/icons-material/MarkunreadRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { DIFF_COLOR, surface, tint } from '../dashboard/dashboardUtils';
import { tierFor } from '../leaderboard/tiers';
import {
  acceptFriendInvite,
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  fetchFriends,
  removeFriend,
  sendFriendRequest,
} from './friendsSlice';

const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };
const APT_COLOR = '#8B5CF6';

// Round tonal icon button — the one button style used across this tab.
const tonal = (color = 'primary') => (t) => ({
  width: 40,
  height: 40,
  flexShrink: 0,
  color: `${color}.main`,
  bgcolor: alpha(t.palette[color].main, 0.12),
  '&:hover': { bgcolor: alpha(t.palette[color].main, 0.22) },
  '&.Mui-disabled': { color: 'text.disabled', bgcolor: 'action.hover' },
});

const rowSx = (t) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 1.25,
  px: 1.5,
  py: 1,
  fontFamily: 'inherit',
  textAlign: 'left',
  borderBottom: `1px solid ${t.palette.divider}`,
});

// Runs a friends thunk, shows the result as a toast, reports success.
function useFriendAction() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [busy, setBusy] = useState('');
  const run = async (key, thunk, okMessage) => {
    setBusy(key);
    const res = await dispatch(thunk);
    setBusy('');
    const ok = res.meta.requestStatus === 'fulfilled';
    enqueueSnackbar(ok ? res.payload || okMessage : res.payload || 'Something went wrong', { variant: ok ? 'success' : 'error' });
    return ok;
  };
  return { busy, run };
}

// "Active today / yesterday / 3d ago" from the YYYY-MM-DD the server sends.
function activeInfo(lastActive) {
  if (!lastActive) return { text: 'Not started', live: false };
  const today = new Date().toISOString().slice(0, 10);
  const days = Math.round((Date.parse(today) - Date.parse(lastActive)) / 86400000);
  if (days <= 0) return { text: 'Active today', live: true };
  if (days === 1) return { text: 'Active yesterday', live: false };
  return { text: `Active ${days}d ago`, live: false };
}

function PersonAvatar({ person, size = 38, live, ring }) {
  const avatar = (
    <Avatar
      src={person.avatarUrl || undefined}
      sx={{ width: size, height: size, fontSize: size * 0.4, fontWeight: 700, ...(ring && { border: `3px solid ${ring}` }) }}
    >
      {person.name?.[0]?.toUpperCase()}
    </Avatar>
  );
  if (live === undefined) return avatar;
  return (
    <Badge variant="dot" overlap="circular" invisible={!live} color="success" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      {avatar}
    </Badge>
  );
}

function Names({ person }) {
  return (
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{person.name}</Typography>
      <Typography variant="caption" noWrap color="text.secondary" sx={{ display: 'block' }}>@{person.handle}</Typography>
    </Box>
  );
}

function Streak({ value }) {
  if (!value) return null;
  return (
    <Stack direction="row" alignItems="center" spacing={0.25}>
      <LocalFireDepartmentRoundedIcon sx={{ fontSize: 17, color: 'warning.main' }} />
      <Typography variant="caption" sx={{ fontWeight: 700, ...mono }}>{value}</Typography>
    </Stack>
  );
}

// A friend: tap the row to see who they are.
function FriendRow({ f, onOpen }) {
  return (
    <ButtonBase onClick={() => onOpen(f.userId)} aria-label={`Open ${f.name}`} sx={(t) => ({ ...rowSx(t), '&:hover': { bgcolor: t.palette.action.hover } })}>
      <PersonAvatar person={f} live={activeInfo(f.lastActive).live} />
      <Names person={f} />
      <Streak value={f.streak} />
      <Typography sx={{ fontWeight: 800, minWidth: 40, textAlign: 'right', ...mono }}>{f.score.toLocaleString()}</Typography>
      <ChevronRightRoundedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
    </ButtonBase>
  );
}

function PlainRow({ person, action }) {
  return (
    <Box sx={(t) => ({ ...rowSx(t), cursor: 'default' })}>
      <PersonAvatar person={person} />
      <Names person={person} />
      {action}
    </Box>
  );
}

function Note({ icon, children }) {
  return (
    <Stack alignItems="center" spacing={1} sx={{ py: 4, px: 2, color: 'text.secondary', textAlign: 'center' }}>
      {icon}
      <Typography variant="body2">{children}</Typography>
    </Stack>
  );
}

function Label({ children }) {
  return (
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1.5, pt: 1.25, pb: 0.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
      {children}
    </Typography>
  );
}

// Friend profile: who they are, how they're doing, remove.
function FriendProfile({ f, onClose, onRemove }) {
  const { tier } = tierFor(f.score);
  const act = activeInfo(f.lastActive);
  const since = f.since ? new Date(f.since).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : null;

  const stats = [
    [<EmojiEventsRoundedIcon key="r" />, f.rank ? `#${f.rank}` : '–', 'Rank', '#F59E0B'],
    [<BoltRoundedIcon key="s" />, f.score.toLocaleString(), 'Points', tier.color],
    [<CheckCircleRoundedIcon key="c" />, f.solved, 'Solved', DIFF_COLOR.Easy],
    [<LocalFireDepartmentRoundedIcon key="f" />, f.streak || 0, 'Streak', '#F97316'],
  ];
  const parts = [
    ['Easy', f.easy, DIFF_COLOR.Easy],
    ['Med', f.medium, DIFF_COLOR.Medium],
    ['Hard', f.hard, DIFF_COLOR.Hard],
    ['Apt', f.aptitude, APT_COLOR],
  ];

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '18px' } } }}>
      <Box sx={{ position: 'relative', pt: 3, px: 2.5, pb: 2, textAlign: 'center' }}>
        <IconButton aria-label="Close" onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <CloseRoundedIcon />
        </IconButton>
        <Box sx={{ display: 'inline-flex' }}>
          <PersonAvatar person={f} size={80} ring={tier.color} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', mt: 1.25 }}>{f.name}</Typography>
        <Typography variant="body2" color="text.secondary">@{f.handle}</Typography>

        <Stack direction="row" spacing={0.75} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.35, borderRadius: 999, bgcolor: tint(tier.color, 16), color: tier.color, fontWeight: 700, fontSize: 13 }}>
            <WorkspacePremiumRoundedIcon sx={{ fontSize: 16 }} /> {tier.name}
          </Box>
          {f.company && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.35, borderRadius: 999, bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 600, fontSize: 13 }}>
              <BusinessRoundedIcon sx={{ fontSize: 16 }} /> {f.company}
            </Box>
          )}
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.35, borderRadius: 999, bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 600, fontSize: 13 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: act.live ? 'success.main' : 'text.disabled' }} />
            {act.text}
          </Box>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mt: 2.25 }}>
          {stats.map(([icon, value, label, color]) => (
            <Box key={label} sx={(t) => ({ py: 1.25, borderRadius: '12px', border: `1px solid ${t.palette.divider}` })}>
              <Box sx={{ color, display: 'grid', placeItems: 'center', '& svg': { fontSize: 20 } }}>{icon}</Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.3, ...mono }}>{value}</Typography>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
            </Box>
          ))}
        </Box>

        <Stack direction="row" spacing={0.75} justifyContent="center" sx={{ mt: 1.5 }}>
          {parts.map(([label, n, color]) => (
            <Box key={label} sx={{ flex: 1, py: 0.6, borderRadius: '10px', bgcolor: tint(color, 14) }}>
              <Typography sx={{ fontWeight: 800, color, lineHeight: 1.2, ...mono }}>{n}</Typography>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
            </Box>
          ))}
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2.25 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: 'text.secondary' }}>
            <PeopleAltRoundedIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption">{since ? `Friends since ${since}` : 'Friends'}</Typography>
          </Stack>
          <Tooltip title="Remove friend">
            <IconButton aria-label={`Remove ${f.name}`} onClick={onRemove} sx={tonal('error')}>
              <PersonRemoveRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Dialog>
  );
}

// ?invite=handle — someone shared their link with me. One slim row: ✓ accept, ✕ dismiss.
function InviteBanner({ handle, onDone }) {
  const [state, setState] = useState({ loading: true });
  const { busy, run } = useFriendAction();

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true });
    friendsApi
      .previewInvite(handle)
      .then(({ data }) => !cancelled && setState({ loading: false, ...data.data }))
      .catch((err) => !cancelled && setState({ loading: false, error: extractErrorMessage(err) }));
    return () => { cancelled = true; };
  }, [handle]);

  if (state.loading) return <Skeleton variant="rounded" height={56} sx={{ borderRadius: '14px' }} />;
  if (state.error) return <Alert severity="warning" onClose={onDone}>{state.error}</Alert>;
  if (state.isSelf) return <Alert severity="info" onClose={onDone}>This is your own invite link.</Alert>;
  if (state.relation === 'friends') return <Alert severity="success" onClose={onDone}>You and @{state.user.handle} are already friends.</Alert>;

  const accept = async () => {
    if (await run('invite', acceptFriendInvite(handle), `You and @${handle} are now friends`)) onDone();
  };

  return (
    <Box sx={[surface, (t) => ({ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1, borderColor: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.06) })]}>
      <PersonAvatar person={state.user} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{state.user.name}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>invited you to be friends</Typography>
      </Box>
      <Tooltip title="Accept">
        <span>
          <IconButton aria-label="Accept invite" onClick={accept} disabled={busy === 'invite'} sx={tonal('success')}><CheckRoundedIcon /></IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Not now">
        <IconButton aria-label="Dismiss invite" onClick={onDone} sx={{ width: 40, height: 40, bgcolor: 'action.hover' }}><CloseRoundedIcon /></IconButton>
      </Tooltip>
    </Box>
  );
}

function FriendsPanel({ user, inviteHandle, onClearInvite, onOpenLeaderboard }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { friends, incoming, outgoing, loaded, loading, error } = useSelector((s) => s.friends);
  const { busy, run } = useFriendAction();

  const [tab, setTab] = useState('friends');
  const [q, setQ] = useState('');
  const [players, setPlayers] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [inviteAnchor, setInviteAnchor] = useState(null);

  const needle = q.trim().toLowerCase().replace(/^@/, '');
  const canSearchServer = needle.length >= 2 && /^[a-z0-9_]+$/.test(needle);

  // New players: handle-prefix search on the server (people who aren't friends yet).
  useEffect(() => {
    if (!canSearchServer) {
      setPlayers(null);
      setSearchError('');
      setSearching(false);
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(() => {
      friendsApi
        .search(needle)
        .then(({ data }) => { if (!cancelled) { setPlayers(data.data); setSearchError(''); } })
        .catch((err) => { if (!cancelled) { setPlayers([]); setSearchError(extractErrorMessage(err)); } })
        .finally(() => { if (!cancelled) setSearching(false); });
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [needle, canSearchServer]);

  const friendIds = new Set(friends.map((f) => f.userId));
  const sentIds = new Set(outgoing.map((o) => o.user.userId));
  const received = new Map(incoming.map((i) => [i.user.userId, i.requestId]));
  const profile = friends.find((f) => f.userId === profileId) || null;

  const link = `${window.location.origin}/dashboard?view=friends&invite=${user.handle}`;
  const message = `Join me on JeetCode! I'm @${user.handle} — add me as a friend and let's compete on the leaderboard.`;
  const closeInvite = () => setInviteAnchor(null);
  const copy = async () => {
    closeInvite();
    try {
      await navigator.clipboard.writeText(link);
      enqueueSnackbar('Invite link copied', { variant: 'success' });
    } catch {
      enqueueSnackbar(link, { variant: 'info' });
    }
  };
  const share = async () => {
    closeInvite();
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title: 'Join me on JeetCode', text: message, url: link });
    } catch { /* share sheet dismissed */ }
    return undefined;
  };

  const playerAction = (p) => {
    if (sentIds.has(p.userId)) {
      return <Tooltip title="Requested"><span><IconButton disabled aria-label="Requested" sx={tonal()}><HourglassTopRoundedIcon /></IconButton></span></Tooltip>;
    }
    if (received.has(p.userId)) {
      return (
        <Tooltip title="Accept">
          <span><IconButton aria-label={`Accept ${p.handle}`} disabled={busy === p.userId} onClick={() => run(p.userId, acceptFriendRequest(received.get(p.userId)), 'Friend added')} sx={tonal('success')}><CheckRoundedIcon /></IconButton></span>
        </Tooltip>
      );
    }
    return (
      <Tooltip title="Add friend">
        <span><IconButton aria-label={`Add ${p.handle}`} disabled={busy === p.userId} onClick={() => run(p.userId, sendFriendRequest(p.handle), 'Request sent')} sx={tonal()}><PersonAddAlt1RoundedIcon /></IconButton></span>
      </Tooltip>
    );
  };

  const tabs = [
    { key: 'friends', icon: PeopleAltRoundedIcon, label: 'Friends', n: friends.length },
    { key: 'requests', icon: MarkunreadRoundedIcon, label: 'Requests', n: incoming.length, alert: true },
    { key: 'sent', icon: HourglassTopRoundedIcon, label: 'Sent', n: outgoing.length },
  ];

  // ---- what to show under the toolbar
  let body;
  if (needle) {
    const mine = friends.filter((f) => f.name.toLowerCase().includes(needle) || f.handle.includes(needle));
    const others = (players || []).filter((p) => !friendIds.has(p.userId));
    body = (
      <>
        {mine.length > 0 && <Label>Your friends</Label>}
        {mine.map((f) => <FriendRow key={f.userId} f={f} onOpen={setProfileId} />)}
        {canSearchServer && <Label>Players</Label>}
        {searching && !players && <Skeleton variant="rounded" height={48} sx={{ mx: 1.5, my: 1, borderRadius: '12px' }} />}
        {others.map((p) => <PlainRow key={p.userId} person={p} action={playerAction(p)} />)}
        {searchError && <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, py: 1.5 }}>{searchError}</Typography>}
        {!searching && !searchError && mine.length === 0 && others.length === 0 && (
          <Note icon={<SearchRoundedIcon />}>{canSearchServer ? `No player “${needle}”` : 'Type at least 2 letters of a handle'}</Note>
        )}
      </>
    );
  } else if (tab === 'friends') {
    body = (
      <>
        {!loaded && loading && [0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={48} sx={{ mx: 1.5, my: 1, borderRadius: '12px' }} />)}
        {loaded && friends.length === 0 && (
          <Note icon={<PeopleAltRoundedIcon sx={{ fontSize: 34 }} />}>No friends yet. Tap the share icon to invite, or search a handle.</Note>
        )}
        {friends.map((f) => <FriendRow key={f.userId} f={f} onOpen={setProfileId} />)}
      </>
    );
  } else if (tab === 'requests') {
    body = (
      <>
        {incoming.length === 0 && <Note icon={<MarkunreadRoundedIcon sx={{ fontSize: 34 }} />}>No requests waiting.</Note>}
        {incoming.map((r) => (
          <PlainRow
            key={r.requestId}
            person={r.user}
            action={
              <Stack direction="row" spacing={0.75}>
                <Tooltip title="Accept"><span><IconButton aria-label={`Accept ${r.user.handle}`} disabled={busy === r.requestId} onClick={() => run(r.requestId, acceptFriendRequest(r.requestId), 'Friend added')} sx={tonal('success')}><CheckRoundedIcon /></IconButton></span></Tooltip>
                <Tooltip title="Decline"><span><IconButton aria-label={`Decline ${r.user.handle}`} disabled={busy === r.requestId} onClick={() => run(r.requestId, declineFriendRequest(r.requestId), 'Request declined')} sx={{ width: 40, height: 40, bgcolor: 'action.hover' }}><CloseRoundedIcon /></IconButton></span></Tooltip>
              </Stack>
            }
          />
        ))}
      </>
    );
  } else {
    body = (
      <>
        {outgoing.length === 0 && <Note icon={<HourglassTopRoundedIcon sx={{ fontSize: 34 }} />}>Nothing pending.</Note>}
        {outgoing.map((r) => (
          <PlainRow
            key={r.requestId}
            person={r.user}
            action={<Tooltip title="Cancel request"><span><IconButton aria-label={`Cancel request to ${r.user.handle}`} disabled={busy === r.requestId} onClick={() => run(r.requestId, cancelFriendRequest(r.requestId), 'Request cancelled')} sx={{ width: 40, height: 40, bgcolor: 'action.hover' }}><CloseRoundedIcon /></IconButton></span></Tooltip>}
          />
        ))}
      </>
    );
  }

  return (
    <Stack spacing={1.5}>
      {inviteHandle && <InviteBanner handle={inviteHandle} onDone={onClearInvite} />}

      <Box sx={[surface, { overflow: 'hidden' }]}>
        {/* toolbar: search + invite + leaderboard */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1.25 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search friends or players"
            value={q}
            onChange={(e) => setQ(e.target.value.slice(0, 40))}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 999 } }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment>,
                endAdornment: q ? (
                  <InputAdornment position="end">
                    <IconButton size="small" aria-label="Clear search" onClick={() => setQ('')}><CloseRoundedIcon fontSize="small" /></IconButton>
                  </InputAdornment>
                ) : null,
              },
              htmlInput: { 'aria-label': 'Search friends or players', autoCapitalize: 'none', autoCorrect: 'off' },
            }}
          />
          <Tooltip title="Invite friends">
            <IconButton aria-label="Invite friends" onClick={(e) => setInviteAnchor(e.currentTarget)} sx={tonal()}>
              <IosShareRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Friends leaderboard">
            <IconButton aria-label="Friends leaderboard" onClick={onOpenLeaderboard} sx={tonal()}>
              <LeaderboardRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* icon tabs with counts */}
        <Stack direction="row" spacing={1} sx={{ px: 1.25, pb: 1.25 }}>
          {tabs.map(({ key, icon: Icon, label, n, alert }) => {
            const active = !needle && tab === key;
            const hot = alert && n > 0;
            return (
              <Tooltip key={key} title={label}>
                <ButtonBase
                  onClick={() => { setQ(''); setTab(key); }}
                  aria-label={`${label}: ${n}`}
                  aria-pressed={active}
                  sx={(t) => ({
                    gap: 0.75,
                    height: 36,
                    px: 1.75,
                    borderRadius: 999,
                    fontFamily: 'inherit',
                    border: `1px solid ${active ? 'transparent' : hot ? t.palette.error.main : t.palette.divider}`,
                    bgcolor: active ? t.palette.text.primary : hot ? alpha(t.palette.error.main, 0.08) : 'transparent',
                    color: active ? t.palette.background.paper : hot ? t.palette.error.main : t.palette.text.primary,
                  })}
                >
                  <Icon sx={{ fontSize: 19 }} />
                  <Typography variant="body2" sx={{ fontWeight: 800, ...mono }}>{n}</Typography>
                </ButtonBase>
              </Tooltip>
            );
          })}
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mx: 1.25, mb: 1.25 }} action={<Button color="inherit" onClick={() => dispatch(fetchFriends())}>Retry</Button>}>{error}</Alert>
        )}

        <Box sx={(t) => ({ borderTop: `1px solid ${t.palette.divider}`, '& > :last-child': { borderBottom: 'none' } })}>{body}</Box>
      </Box>

      {/* invite menu */}
      <Menu anchorEl={inviteAnchor} open={Boolean(inviteAnchor)} onClose={closeInvite}>
        <MenuItem onClick={copy} sx={{ minHeight: 46 }}><ListItemIcon><ContentCopyRoundedIcon fontSize="small" /></ListItemIcon>Copy link</MenuItem>
        <MenuItem onClick={share} sx={{ minHeight: 46 }}><ListItemIcon><IosShareRoundedIcon fontSize="small" /></ListItemIcon>Share…</MenuItem>
        <MenuItem component="a" href={`https://wa.me/?text=${encodeURIComponent(`${message} ${link}`)}`} target="_blank" rel="noopener noreferrer" onClick={closeInvite} sx={{ minHeight: 46 }}>
          <ListItemIcon><WhatsAppIcon fontSize="small" /></ListItemIcon>WhatsApp
        </MenuItem>
      </Menu>

      {profile && <FriendProfile f={profile} onClose={() => setProfileId(null)} onRemove={() => setConfirm(profile)} />}

      <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Remove friend?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm?.name} (@{confirm?.handle}) will leave your friends list and friends leaderboard. You can add them again later.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disableElevation
            disabled={busy === 'remove'}
            onClick={async () => {
              if (await run('remove', removeFriend(confirm.userId), 'Friend removed')) {
                setConfirm(null);
                setProfileId(null);
              }
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default function FriendsView({ isAuthenticated, user, inviteHandle, onClearInvite, onOpenLeaderboard }) {
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <Box sx={[surface, { p: 3, textAlign: 'center' }]}>
        <PeopleAltRoundedIcon sx={{ fontSize: 36, color: 'primary.main' }} />
        <Typography sx={{ fontWeight: 800, mt: 0.5 }}>Compete with friends</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          {inviteHandle ? `@${inviteHandle} invited you. Log in or sign up to accept.` : 'Log in to add friends and see them on the leaderboard.'}
        </Typography>
        <Button variant="contained" disableElevation onClick={() => navigate('/login', { state: { from: { pathname: '/dashboard' } } })} sx={{ height: 44, px: 3 }}>
          Log in
        </Button>
      </Box>
    );
  }
  return <FriendsPanel user={user} inviteHandle={inviteHandle} onClearInvite={onClearInvite} onOpenLeaderboard={onOpenLeaderboard} />;
}
