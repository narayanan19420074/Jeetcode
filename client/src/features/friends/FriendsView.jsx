import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Alert, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton,
  InputAdornment, Skeleton, Stack, TextField, Tooltip, Typography, alpha,
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
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { surface } from '../dashboard/dashboardUtils';
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

function PersonCell({ person, sub, size = 46 }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
      <Avatar src={person.avatarUrl || undefined} sx={{ width: size, height: size, fontWeight: 700 }}>
        {person.name?.[0]?.toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 700, lineHeight: 1.3 }}>{person.name}</Typography>
        <Typography noWrap variant="body2" color="text.secondary">@{person.handle}{sub ? ` · ${sub}` : ''}</Typography>
      </Box>
    </Stack>
  );
}

function Section({ icon, title, count, children }) {
  return (
    <Box sx={[surface, { p: { xs: 2, sm: 2.5 } }]}>
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
        <Box sx={(t) => ({ width: 36, height: 36, borderRadius: '10px', display: 'grid', placeItems: 'center', color: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.12) })}>
          {icon}
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', flex: 1 }}>{title}</Typography>
        {count !== undefined && <Typography color="text.secondary" sx={{ fontWeight: 700, ...mono }}>{count}</Typography>}
      </Stack>
      {children}
    </Box>
  );
}

function StatTile({ label, value, hint, highlight }) {
  return (
    <Box
      sx={[surface, (t) => ({ p: 1.75, flex: 1, minWidth: 0, ...(highlight && { borderColor: 'error.main', bgcolor: alpha(t.palette.error.main, 0.06) }) })]}
    >
      <Typography noWrap variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 800, fontSize: '1.7rem', lineHeight: 1.2, ...mono }}>{value}</Typography>
      {hint && <Typography noWrap variant="caption" color="text.secondary">{hint}</Typography>}
    </Box>
  );
}

// ?invite=handle — someone shared their link with me.
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

  if (state.loading) return <Skeleton variant="rounded" height={84} sx={{ borderRadius: '14px' }} />;
  if (state.error) {
    return <Alert severity="warning" onClose={onDone}>{state.error}</Alert>;
  }
  if (state.isSelf) return <Alert severity="info" onClose={onDone}>This is your own invite link — share it with friends.</Alert>;
  if (state.relation === 'friends') return <Alert severity="success" onClose={onDone}>You and @{state.user.handle} are already friends.</Alert>;

  const accept = async () => {
    if (await run('invite', acceptFriendInvite(handle), `You and @${handle} are now friends`)) onDone();
  };

  return (
    <Box sx={[surface, (t) => ({ p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', borderColor: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.06) })]}>
      <PersonCell person={state.user} sub="invited you to be friends" size={52} />
      <Stack direction="row" spacing={1}>
        <Button variant="contained" disableElevation startIcon={<CheckRoundedIcon />} onClick={accept} disabled={busy === 'invite'} sx={{ height: 44 }}>
          Accept
        </Button>
        <Button color="inherit" onClick={onDone} sx={{ height: 44 }}>Not now</Button>
      </Stack>
    </Box>
  );
}

function InviteCard({ user }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/dashboard?view=friends&invite=${user.handle}`;
  const message = `Join me on JeetCode! I'm @${user.handle} — add me as a friend and let's compete on the leaderboard.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* the link is visible in the field so it can be copied by hand */ }
  };
  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title: 'Join me on JeetCode', text: message, url: link });
    } catch { /* share sheet dismissed */ }
    return undefined;
  };

  return (
    <Section icon={<IosShareRoundedIcon />} title="Invite friends">
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Share your link. Anyone who opens it can become your friend in one tap — even new players after they sign up.
      </Typography>
      <TextField
        fullWidth
        value={link}
        slotProps={{ input: { readOnly: true, style: { fontSize: 14 } }, htmlInput: { 'aria-label': 'Your invite link' } }}
        onFocus={(e) => e.target.select()}
      />
      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
        <Button variant="contained" disableElevation startIcon={copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />} onClick={copy} sx={{ height: 44 }}>
          {copied ? 'Copied' : 'Copy link'}
        </Button>
        <Button variant="outlined" startIcon={<IosShareRoundedIcon />} onClick={share} sx={{ height: 44 }}>Share</Button>
        <Button
          variant="outlined"
          color="success"
          startIcon={<WhatsAppIcon />}
          component="a"
          href={`https://wa.me/?text=${encodeURIComponent(`${message} ${link}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ height: 44 }}
        >
          WhatsApp
        </Button>
      </Stack>
    </Section>
  );
}

function AddFriendCard() {
  const { friends, incoming, outgoing } = useSelector((s) => s.friends);
  const { busy, run } = useFriendAction();
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const term = q.trim().replace(/^@/, '').toLowerCase();

  useEffect(() => {
    if (term.length < 2) {
      setResults(null);
      setError('');
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(() => {
      friendsApi
        .search(term)
        .then(({ data }) => { if (!cancelled) { setResults(data.data); setError(''); } })
        .catch((err) => { if (!cancelled) { setResults([]); setError(extractErrorMessage(err)); } })
        .finally(() => { if (!cancelled) setSearching(false); });
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [term]);

  // Relationship comes from the shared store, so the button updates the moment you tap it.
  const friendIds = new Set(friends.map((f) => f.userId));
  const sentIds = new Set(outgoing.map((o) => o.user.userId));
  const received = new Map(incoming.map((i) => [i.user.userId, i.requestId]));

  const action = (p) => {
    if (friendIds.has(p.userId)) return <Button disabled startIcon={<CheckCircleRoundedIcon />} sx={{ height: 40 }}>Friends</Button>;
    if (sentIds.has(p.userId)) return <Button disabled startIcon={<HourglassTopRoundedIcon />} sx={{ height: 40 }}>Requested</Button>;
    if (received.has(p.userId)) {
      return (
        <Button variant="contained" disableElevation startIcon={<CheckRoundedIcon />} disabled={busy === p.userId} onClick={() => run(p.userId, acceptFriendRequest(received.get(p.userId)), 'Friend added')} sx={{ height: 40 }}>
          Accept
        </Button>
      );
    }
    return (
      <Button variant="contained" disableElevation startIcon={<PersonAddAlt1RoundedIcon />} disabled={busy === p.userId} onClick={() => run(p.userId, sendFriendRequest(p.handle), 'Request sent')} sx={{ height: 40 }}>
        Add
      </Button>
    );
  };

  return (
    <Section icon={<PersonAddAlt1RoundedIcon />} title="Add a friend">
      <TextField
        fullWidth
        placeholder="Search by handle, e.g. @naru"
        value={q}
        onChange={(e) => setQ(e.target.value.slice(0, 31))}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment>,
            endAdornment: q ? (
              <InputAdornment position="end">
                <IconButton aria-label="Clear" onClick={() => setQ('')}><CloseRoundedIcon fontSize="small" /></IconButton>
              </InputAdornment>
            ) : null,
          },
          htmlInput: { 'aria-label': 'Search players by handle', autoCapitalize: 'none', autoCorrect: 'off' },
        }}
      />
      {error && <Alert severity="info" sx={{ mt: 1.5 }}>{error}</Alert>}
      {searching && !results && <Skeleton variant="rounded" height={56} sx={{ mt: 1.5, borderRadius: '12px' }} />}
      {results && !error && results.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: '0.92rem' }}>No player with a handle starting “{term}”.</Typography>
      )}
      {results?.map((p) => (
        <Stack key={p.userId} direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
          <PersonCell person={p} />
          {action(p)}
        </Stack>
      ))}
    </Section>
  );
}

function RequestsCard() {
  const { incoming, outgoing } = useSelector((s) => s.friends);
  const { busy, run } = useFriendAction();
  if (!incoming.length && !outgoing.length) return null;

  return (
    <Section icon={<MarkunreadRoundedIcon />} title="Requests" count={incoming.length || undefined}>
      {incoming.map((r) => (
        <Stack key={r.requestId} direction="row" alignItems="center" spacing={1} sx={{ py: 0.75 }}>
          <PersonCell person={r.user} sub="wants to be friends" />
          <Tooltip title="Accept">
            <span>
              <IconButton aria-label={`Accept ${r.user.handle}`} disabled={busy === r.requestId} onClick={() => run(r.requestId, acceptFriendRequest(r.requestId), 'Friend added')} sx={(t) => ({ width: 44, height: 44, color: 'success.main', bgcolor: alpha(t.palette.success.main, 0.12) })}>
                <CheckRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Decline">
            <span>
              <IconButton aria-label={`Decline ${r.user.handle}`} disabled={busy === r.requestId} onClick={() => run(r.requestId, declineFriendRequest(r.requestId), 'Request declined')} sx={{ width: 44, height: 44, bgcolor: 'action.hover' }}>
                <CloseRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      ))}
      {outgoing.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, mt: incoming.length ? 1.5 : 0, mb: 0.5 }}>Sent</Typography>
      )}
      {outgoing.map((r) => (
        <Stack key={r.requestId} direction="row" alignItems="center" spacing={1} sx={{ py: 0.75 }}>
          <PersonCell person={r.user} sub="request pending" />
          <Button color="inherit" disabled={busy === r.requestId} onClick={() => run(r.requestId, cancelFriendRequest(r.requestId), 'Request cancelled')} sx={{ height: 40 }}>
            Cancel
          </Button>
        </Stack>
      ))}
    </Section>
  );
}

function FriendsList({ onOpenLeaderboard }) {
  const { friends, loaded, loading, error } = useSelector((s) => s.friends);
  const dispatch = useDispatch();
  const { busy, run } = useFriendAction();
  const [confirm, setConfirm] = useState(null);

  return (
    <Section icon={<PeopleAltRoundedIcon />} title="Your friends" count={friends.length}>
      {error && (
        <Alert severity="error" action={<Button color="inherit" onClick={() => dispatch(fetchFriends())}>Retry</Button>}>{error}</Alert>
      )}
      {!loaded && loading && [0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={56} sx={{ mb: 1, borderRadius: '12px' }} />)}
      {loaded && friends.length === 0 && (
        <Stack alignItems="center" textAlign="center" spacing={1} sx={{ py: 4 }}>
          <Box sx={(t) => ({ width: 64, height: 64, borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.12) })}>
            <PeopleAltRoundedIcon sx={{ fontSize: 30 }} />
          </Box>
          <Typography sx={{ fontWeight: 700 }}>No friends yet</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 320, fontSize: '0.92rem' }}>
            Share your invite link or search a handle above. Friends show up here and on the leaderboard.
          </Typography>
        </Stack>
      )}
      {friends.map((f, i) => (
        <Stack key={f.userId} direction="row" alignItems="center" spacing={1.25} sx={{ py: 1.1, borderTop: i ? '1px solid' : 'none', borderColor: 'divider' }}>
          <PersonCell person={f} sub={f.rank ? `Rank #${f.rank}` : 'No solves yet'} />
          {f.streak > 0 && (
            <Stack direction="row" alignItems="center" sx={{ color: 'warning.main' }}>
              <LocalFireDepartmentRoundedIcon sx={{ fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', ...mono }}>{f.streak}</Typography>
            </Stack>
          )}
          <Box sx={{ textAlign: 'right', minWidth: 64 }}>
            <Typography sx={{ fontWeight: 800, ...mono }}>{f.score.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">{f.solved} solved</Typography>
          </Box>
          <Tooltip title="Remove friend">
            <IconButton aria-label={`Remove ${f.name}`} onClick={() => setConfirm(f)} sx={{ width: 44, height: 44 }}>
              <PersonRemoveRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ))}
      {friends.length > 0 && (
        <Button fullWidth variant="outlined" startIcon={<LeaderboardRoundedIcon />} onClick={onOpenLeaderboard} sx={{ mt: 1.5, height: 46 }}>
          See friends on the leaderboard
        </Button>
      )}

      <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Remove friend?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm?.name} (@{confirm?.handle}) will no longer appear in your friends list or friends leaderboard. You can add them again later.
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
              if (await run('remove', removeFriend(confirm.userId), 'Friend removed')) setConfirm(null);
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Section>
  );
}

export default function FriendsView({ isAuthenticated, user, inviteHandle, onClearInvite, onOpenLeaderboard }) {
  const navigate = useNavigate();
  const { friends, incoming, outgoing, maxFriends } = useSelector((s) => s.friends);

  if (!isAuthenticated) {
    return (
      <Box sx={[surface, { p: 4, textAlign: 'center' }]}>
        <PeopleAltRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', mt: 1 }}>Compete with friends</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          {inviteHandle ? `@${inviteHandle} invited you. Log in or sign up to accept.` : 'Log in to add friends and see them on the leaderboard.'}
        </Typography>
        <Button variant="contained" disableElevation onClick={() => navigate('/login', { state: { from: { pathname: '/dashboard' } } })} sx={{ height: 46, px: 3 }}>
          Log in
        </Button>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Friends</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.92rem' }}>
          Add friends, invite them, and see how they rank.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1.5}>
        <StatTile label="Friends" value={friends.length} hint={`of ${maxFriends}`} />
        <StatTile label="Requests" value={incoming.length} hint={incoming.length ? 'waiting for you' : 'none waiting'} highlight={incoming.length > 0} />
        <StatTile label="Sent" value={outgoing.length} hint="pending" />
      </Stack>

      {inviteHandle && <InviteBanner handle={inviteHandle} onDone={onClearInvite} />}
      <RequestsCard />
      <FriendsList onOpenLeaderboard={onOpenLeaderboard} />
      <AddFriendCard />
      <InviteCard user={user} />
    </Stack>
  );
}
