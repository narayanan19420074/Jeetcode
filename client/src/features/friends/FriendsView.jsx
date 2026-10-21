import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Alert, AvatarGroup, Avatar, Badge, Box, Button, ButtonBase, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  IconButton, InputAdornment, ListItemIcon, Menu, MenuItem, Skeleton, Stack, TextField, Tooltip, Typography, alpha,
} from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import MarkunreadRoundedIcon from '@mui/icons-material/MarkunreadRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
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
import { PersonAvatar, Streak, mono, practisedToday, statusInfo, tonal } from './friendsUi';
import FriendChat from './FriendChat';
import ActivityFeed from './ActivityFeed';
import FriendProfileDialog from './FriendProfileDialog';

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

function Names({ person }) {
  return (
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{person.name}</Typography>
      <Typography variant="caption" noWrap color="text.secondary" sx={{ display: 'block' }}>@{person.handle}</Typography>
    </Box>
  );
}

// A friend: tap the row for their profile; quick buttons for chat / code together / nudge.
function FriendRow({ f, online, unread, onOpen, onChat, onCode, onNudge, busy }) {
  const st = statusInfo(f, online);
  const canNudge = !practisedToday(f);
  return (
    <Box sx={(t) => ({ ...rowSx(t), '&:hover': { bgcolor: t.palette.action.hover }, transition: 'background-color .15s' })}>
      <ButtonBase onClick={() => onOpen(f.userId)} aria-label={`Open ${f.name}`} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flex: 1, minWidth: 0, textAlign: 'left', fontFamily: 'inherit', borderRadius: '10px' }}>
        <PersonAvatar person={f} online={online} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{f.name}</Typography>
            <Streak value={f.streak} />
          </Stack>
          <Typography variant="caption" noWrap sx={{ display: 'block', color: st.live ? 'success.main' : 'text.secondary', fontWeight: st.live ? 700 : 400 }}>
            {st.text} · <span style={mono}>{f.score.toLocaleString()} pts</span>
          </Typography>
        </Box>
      </ButtonBase>
      <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
        {canNudge && (
          <Tooltip title="Nudge — remind about streak">
            <span><IconButton aria-label={`Nudge ${f.handle}`} disabled={busy === `nudge:${f.userId}`} onClick={() => onNudge(f)} sx={tonal('warning', 36)}><NotificationsActiveRoundedIcon sx={{ fontSize: 19 }} /></IconButton></span>
          </Tooltip>
        )}
        <Tooltip title="Code together">
          <span><IconButton aria-label={`Code together with ${f.handle}`} disabled={busy === `room:${f.userId}`} onClick={() => onCode(f)} sx={{ ...tonal('success', 36), display: { xs: 'none', sm: 'inline-flex' } }}><LaptopMacRoundedIcon sx={{ fontSize: 19 }} /></IconButton></span>
        </Tooltip>
        <Tooltip title="Chat">
          <IconButton aria-label={`Chat with ${f.handle}`} onClick={() => onChat(f)} sx={tonal('primary', 36)}>
            <Badge badgeContent={unread} color="error" max={99}><ChatRoundedIcon sx={{ fontSize: 19 }} /></Badge>
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
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
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { friends, incoming, outgoing, loaded, loading, error, online, unread } = useSelector((s) => s.friends);
  const { busy, run } = useFriendAction();
  const [chatId, setChatId] = useState(null);
  const [acting, setActing] = useState('');

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
  const chatFriend = friends.find((f) => f.userId === chatId) || null;
  const onlineFriends = friends.filter((f) => online[f.userId]);
  const unreadTotal = Object.values(unread).reduce((a, n) => a + n, 0);
  // online first, then by points
  const sortedFriends = [...friends].sort((a, b) => Number(Boolean(online[b.userId])) - Number(Boolean(online[a.userId])) || b.score - a.score || a.handle.localeCompare(b.handle));

  // /dashboard?view=friends&chat=<id> (from a notification toast) opens that chat
  const chatParam = params.get('chat');
  useEffect(() => {
    if (chatParam && friends.some((f) => f.userId === chatParam)) {
      setChatId(chatParam);
      const next = new URLSearchParams(params);
      next.delete('chat');
      setParams(next, { replace: true });
    }
  }, [chatParam, friends, params, setParams]);

  const codeTogether = async (f) => {
    setActing(`room:${f.userId}`);
    try {
      const { data } = await friendsApi.roomInvite(f.userId);
      enqueueSnackbar(`Invite sent to @${f.handle}`, { variant: 'success' });
      navigate(`/room/${data.data.roomId}`);
    } catch (err) {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    } finally {
      setActing('');
    }
  };

  const nudge = async (f) => {
    setActing(`nudge:${f.userId}`);
    try {
      await friendsApi.nudge(f.userId);
      enqueueSnackbar(`Nudge sent to @${f.handle} 🔥`, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'info' });
    } finally {
      setActing('');
    }
  };

  const rowProps = { onOpen: setProfileId, onChat: (f) => setChatId(f.userId), onCode: codeTogether, onNudge: nudge, busy: acting };

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
    { key: 'activity', icon: TimelineRoundedIcon, label: 'Activity' },
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
        {mine.map((f) => <FriendRow key={f.userId} f={f} unread={unread[f.userId]} online={Boolean(online[f.userId])} {...rowProps} />)}
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
        {sortedFriends.map((f) => <FriendRow key={f.userId} f={f} unread={unread[f.userId]} online={Boolean(online[f.userId])} {...rowProps} />)}
      </>
    );
  } else if (tab === 'activity') {
    body = <ActivityFeed />;
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

      {/* hero: who is online right now */}
      <Box
        sx={[surface, (t) => ({
          p: 2,
          overflow: 'hidden',
          position: 'relative',
          background: `radial-gradient(120% 140% at 0% 0%, ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.22 : 0.14)} 0%, transparent 60%), ${t.palette.background.paper}`,
        })]}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', lineHeight: 1.2 }}>Friends</Typography>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.5 }}>
              <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: onlineFriends.length ? '#22C55E' : 'text.disabled' }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {onlineFriends.length ? `${onlineFriends.length} online now` : friends.length ? 'Nobody online right now' : 'Invite friends to compete together'}
                {unreadTotal ? ` · ${unreadTotal} unread` : ''}
              </Typography>
            </Stack>
          </Box>
          {onlineFriends.length > 0 && (
            <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 34, height: 34, fontSize: 14, fontWeight: 700 } }}>
              {onlineFriends.map((f) => (
                <Tooltip key={f.userId} title={`@${f.handle}`}>
                  <Avatar src={f.avatarUrl || undefined} onClick={() => setChatId(f.userId)} sx={{ cursor: 'pointer' }}>{f.name?.[0]?.toUpperCase()}</Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          )}
        </Stack>
      </Box>

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

        {/* tabs */}
        <Stack direction="row" spacing={1} sx={{ px: 1.25, pb: 1.25, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {tabs.map(({ key, icon: Icon, label, n, alert }) => {
            const active = !needle && tab === key;
            const hot = alert && n > 0;
            return (
              <ButtonBase
                key={key}
                onClick={() => { setQ(''); setTab(key); }}
                aria-label={n === undefined ? label : `${label}: ${n}`}
                aria-pressed={active}
                sx={(t) => ({
                  flexShrink: 0,
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
                {(n === undefined || key === 'friends') && <Typography variant="body2" sx={{ fontWeight: 800, display: n === undefined ? 'block' : { xs: 'none', sm: 'block' } }}>{label}</Typography>}
                {n !== undefined && <Typography variant="body2" sx={{ fontWeight: 800, ...mono }}>{n}</Typography>}
              </ButtonBase>
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

      {profile && (
        <FriendProfileDialog
          f={profile}
          nudging={acting === `nudge:${profile.userId}`}
          onClose={() => setProfileId(null)}
          onRemove={() => setConfirm(profile)}
          onChat={() => { setProfileId(null); setChatId(profile.userId); }}
          onCodeTogether={() => codeTogether(profile)}
          onNudge={() => nudge(profile)}
        />
      )}

      <FriendChat friend={chatFriend} onClose={() => setChatId(null)} onCodeTogether={codeTogether} />

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
