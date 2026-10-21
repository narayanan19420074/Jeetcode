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
import { motion, useReducedMotion } from 'framer-motion';
import { Collapse } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { DIFF_COLOR, surface } from '../dashboard/dashboardUtils';
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
import { AMBER, APT_COLOR, FLAME, GREEN, HERO_BG, CountUp, PersonAvatar, Streak, TierChip, calm, cardSx, glow, mono, practisedToday, statusInfo, sweep, tonal, twinkle } from './friendsUi';
import FriendChat from './FriendChat';
import ActivityFeed from './ActivityFeed';
import FriendProfileDialog from './FriendProfileDialog';

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

// A friend, Leaderboard style: gradient-ring avatar, tier + flame streak, points. Tap to open details.
function FriendRow({ f, index = 0, online, unread, expanded, onToggle, onProfile, onChat, onCode, onNudge, busy }) {
  const reduce = useReducedMotion();
  const { tier, next, progress, toNext } = tierFor(f.score);
  const st = statusInfo(f, online);
  const canNudge = !practisedToday(f);
  const tiles = [['Easy', f.easy, DIFF_COLOR.Easy], ['Medium', f.medium, DIFF_COLOR.Medium], ['Hard', f.hard, DIFF_COLOR.Hard], ['Aptitude', f.aptitude, APT_COLOR]];

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: reduce ? 0 : Math.min(index, 10) * 0.035, ease: 'easeOut' }}
    >
      <Box
        sx={(t) => ({
          ...cardSx(t, online ? { accent: [GREEN, t.palette.primary.main], glowColor: 'rgba(34,197,94,0.45)' } : {}),
          '&::after': online ? { content: '""', position: 'absolute', inset: 0, pointerEvents: 'none', background: `linear-gradient(100deg, ${alpha(GREEN, 0.1)}, transparent 70%)`, animation: `${glow} 2.8s ease-in-out infinite`, ...calm } : undefined,
        })}
      >
        <ButtonBase
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={`${f.name}, ${f.score} points`}
          sx={(t) => ({ position: 'relative', zIndex: 1, width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto 20px', gap: { xs: 1, sm: 1.5 }, alignItems: 'center', textAlign: 'left', px: { xs: 1.25, sm: 2 }, py: 1.1, fontFamily: 'inherit', transition: 'background-color .15s', '&:hover': { bgcolor: t.palette.action.hover } })}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            <PersonAvatar person={f} size={42} online={online} gradient={[tier.color, `color-mix(in srgb, ${tier.color} 40%, #fff)`]} />
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 800, lineHeight: 1.25 }}>{f.name}</Typography>
                {unread > 0 && (
                  <Box component="span" aria-label={`${unread} unread`} sx={{ minWidth: 18, height: 18, px: 0.5, borderRadius: 9, bgcolor: 'error.main', color: 'error.contrastText', fontSize: 11, fontWeight: 800, display: 'grid', placeItems: 'center' }}>{unread}</Box>
                )}
              </Stack>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, mt: 0.2, minWidth: 0 }}>
                <Typography variant="caption" noWrap sx={{ fontWeight: st.live ? 800 : 500, color: st.live ? 'success.main' : 'text.secondary', flexShrink: 1 }}>{st.text}</Typography>
                <Box sx={{ display: { xs: 'none', sm: 'inline-flex' } }}><TierChip tier={tier} /></Box>
                <Streak value={f.streak} />
              </Box>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontWeight: 900, fontSize: 18, lineHeight: 1.1, ...mono }}>{f.score.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: 10.5, letterSpacing: 0.4 }}>PTS</Typography>
          </Box>
          <ExpandMoreRoundedIcon sx={{ fontSize: 20, color: 'text.disabled', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        </ButtonBase>

        <Collapse in={expanded} timeout={220} unmountOnExit>
          <Box sx={(t) => ({ px: { xs: 1.25, sm: 2 }, py: 1.5, bgcolor: alpha(t.palette.text.primary, 0.035), display: 'grid', gap: 1.5 })}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 1 }}>
              {tiles.map(([label, n, color]) => (
                <Box key={label} sx={{ p: 1, textAlign: 'center', minWidth: 0, borderRadius: '12px', border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`, background: `linear-gradient(160deg, color-mix(in srgb, ${color} 20%, transparent), transparent 80%)` }}>
                  <Typography sx={{ fontWeight: 900, fontSize: 19, lineHeight: 1.2, color, ...mono }}>{n}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontWeight: 700 }}>{label}</Typography>
                </Box>
              ))}
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
                <TierChip tier={tier} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {next ? `${toNext.toLocaleString()} pts to ${next.name}` : 'Top level reached'}
                </Typography>
              </Box>
              <Box sx={{ height: 9, borderRadius: 99, bgcolor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ position: 'relative', overflow: 'hidden', height: '100%', width: `${Math.max(progress, 4)}%`, borderRadius: 99, background: `linear-gradient(90deg, ${tier.color}, color-mix(in srgb, ${tier.color} 45%, #fff))`, transition: 'width .6s ease', '&::after': { content: '""', position: 'absolute', top: 0, bottom: 0, width: '35%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)', animation: `${sweep} 2.6s ease-in-out infinite`, ...calm } }} />
              </Box>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button variant="contained" disableElevation startIcon={<Badge badgeContent={unread} color="error" max={99}><ChatRoundedIcon /></Badge>} onClick={() => onChat(f)} sx={{ borderRadius: 999, fontWeight: 800, textTransform: 'none', px: 2 }}>Chat</Button>
              <Button startIcon={<LaptopMacRoundedIcon />} disabled={busy === `room:${f.userId}`} onClick={() => onCode(f)} sx={{ borderRadius: 999, fontWeight: 800, textTransform: 'none', bgcolor: alpha(GREEN, 0.14), color: 'success.main', '&:hover': { bgcolor: alpha(GREEN, 0.24) } }}>Code together</Button>
              {canNudge && (
                <Button startIcon={<LocalFireDepartmentRoundedIcon />} disabled={busy === `nudge:${f.userId}`} onClick={() => onNudge(f)} sx={{ borderRadius: 999, fontWeight: 800, textTransform: 'none', bgcolor: alpha(FLAME, 0.14), color: FLAME, '&:hover': { bgcolor: alpha(FLAME, 0.24) } }}>Nudge</Button>
              )}
              <Button startIcon={<BadgeRoundedIcon />} onClick={() => onProfile(f.userId)} sx={{ borderRadius: 999, fontWeight: 800, textTransform: 'none', bgcolor: 'action.hover', color: 'text.primary' }}>Profile &amp; compare</Button>
            </Stack>
          </Box>
        </Collapse>
      </Box>
    </motion.div>
  );
}

// Requests / sent / search results: same card look, one row.
function PlainRow({ person, action }) {
  return (
    <Box sx={(t) => ({ ...cardSx(t), display: 'flex', alignItems: 'center', gap: 1.25, px: { xs: 1.25, sm: 2 }, py: 1.1 })}>
      <PersonAvatar person={person} size={42} />
      <Names person={person} />
      {action}
    </Box>
  );
}

function SkeletonRows({ count = 5 }) {
  return Array.from({ length: count }, (_, i) => (
    <Box key={i} sx={(t) => ({ ...cardSx(t), display: 'flex', alignItems: 'center', gap: 1.25, px: 1.25, py: 1.1 })}>
      <Skeleton variant="circular" width={42} height={42} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width={`${45 + ((i * 17) % 35)}%`} />
        <Skeleton variant="text" width={110} />
      </Box>
      <Skeleton variant="text" width={40} />
    </Box>
  ));
}

// Dark "stage" header like the Leaderboard podium: who is online, how strong the squad is.
function Hero({ friends, onlineFriends, unreadTotal, onOpenChat }) {
  const best = friends.reduce((m, f) => Math.max(m, f.streak || 0), 0);
  const tiles = [
    ['Friends', friends.length, '#fff', null],
    ['Online', onlineFriends.length, '#4ADE80', null],
    ['Best streak', best, '#FDBA74', <LocalFireDepartmentRoundedIcon key="f" sx={{ fontSize: 15, color: FLAME, filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.8))' }} />],
  ];
  const sparks = [[8, 18, 0], [24, 62, 0.6], [44, 12, 1.2], [70, 16, 0.3], [86, 58, 0.9], [94, 22, 1.5]];
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', p: { xs: 1.75, sm: 2.25 }, borderRadius: '18px', color: '#fff', background: HERO_BG, boxShadow: '0 14px 28px -16px rgba(2,6,23,0.85), inset 0 1px 0 rgba(255,255,255,0.18)' }}>
      <Box aria-hidden sx={{ position: 'absolute', right: -40, top: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.3), transparent 68%)', animation: `${glow} 3s ease-in-out infinite`, ...calm }} />
      {sparks.map(([x, y, d], i) => (
        <Box key={i} aria-hidden sx={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 4, height: 4, borderRadius: '50%', bgcolor: '#fff', animation: `${twinkle} 2.4s ease-in-out ${d}s infinite`, ...calm }} />
      ))}
      <Box sx={{ position: 'relative' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', lineHeight: 1.15 }}>Your squad</Typography>
            <Typography variant="body2" noWrap sx={{ opacity: 0.85, mt: 0.4 }}>
              {friends.length === 0 ? 'Invite friends and compete together' : onlineFriends.length ? `${onlineFriends.length} online right now` : 'Nobody online right now'}
              {unreadTotal ? ` · ${unreadTotal} unread` : ''}
            </Typography>
          </Box>
          {onlineFriends.length > 0 && (
            <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 36, height: 36, fontSize: 14, fontWeight: 700, borderColor: '#312E81' } }}>
              {onlineFriends.map((f) => (
                <Tooltip key={f.userId} title={`@${f.handle}`}>
                  <Avatar src={f.avatarUrl || undefined} onClick={() => onOpenChat(f.userId)} sx={{ cursor: 'pointer' }}>{f.name?.[0]?.toUpperCase()}</Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          )}
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 1, mt: 1.75 }}>
          {tiles.map(([label, n, color, icon]) => (
            <Box key={label} sx={{ py: 1, px: 1, textAlign: 'center', borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(4px)' }}>
              <Typography sx={{ fontWeight: 900, fontSize: 21, lineHeight: 1.15, color, ...mono }}>{icon}<CountUp value={n} /></Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700, letterSpacing: 0.3 }}>{label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
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
  const [openRow, setOpenRow] = useState(null);

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

  const friendRow = (f, i) => (
    <FriendRow
      key={f.userId}
      f={f}
      index={i}
      unread={unread[f.userId]}
      online={Boolean(online[f.userId])}
      expanded={openRow === f.userId}
      onToggle={() => setOpenRow((cur) => (cur === f.userId ? null : f.userId))}
      {...rowProps}
    />
  );
  const rowProps = { onProfile: setProfileId, onChat: (f) => setChatId(f.userId), onCode: codeTogether, onNudge: nudge, busy: acting };

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
        {mine.map((f, i) => friendRow(f, i))}
        {canSearchServer && <Label>Players</Label>}
        {searching && !players && <SkeletonRows count={2} />}
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
        {!loaded && loading && <SkeletonRows />}
        {loaded && friends.length === 0 && (
          <Note icon={<PeopleAltRoundedIcon sx={{ fontSize: 34 }} />}>No friends yet. Tap the share icon to invite, or search a handle.</Note>
        )}
        {sortedFriends.map((f, i) => friendRow(f, i))}
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

      <Hero friends={friends} onlineFriends={onlineFriends} unreadTotal={unreadTotal} onOpenChat={setChatId} />

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

        <Box sx={(t) => ({ borderTop: `1px solid ${t.palette.divider}`, pt: 1, pb: 0.25 })}>{body}</Box>
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
