import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Alert, Badge, Box, Button, ButtonBase, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  IconButton, InputAdornment, ListItemIcon, Menu, MenuItem, Skeleton, Stack, TextField, Tooltip, Typography, alpha, useMediaQuery, useTheme,
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
import WifiTetheringRoundedIcon from '@mui/icons-material/WifiTetheringRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { Collapse } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { DIFF_COLOR, surface } from '../dashboard/dashboardUtils';
import useViewportFill from '../dashboard/useViewportFill';
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
import { AMBER, APT_COLOR, FLAME, GREEN, HERO_BG, CountUp, PersonAvatar, Streak, TierChip, calm, cardSx, glow, mono, practisedToday, statusInfo, sweep, tonal } from './friendsUi';
import FriendChat, { ChatPanel } from './FriendChat';
import FriendProfileDialog, { FriendProfilePanel } from './FriendProfileDialog';

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
// `compact` (desktop): no inline details, a click just selects the friend; the side panel holds chat + every action.
function FriendRow({ f, index = 0, online, unread, expanded, onToggle, onProfile, onChat, onCode, onNudge, onUnfriend, busy, compact = false, selected = false }) {
  const reduce = useReducedMotion();
  // Desktop list: just avatar, name, points and an unfriend icon.
  if (compact) {
    return (
      <Box
        data-fid={f.userId}
        sx={(t) => ({
          display: 'flex', alignItems: 'center', gap: 0.5, height: 52, px: 1, mx: 1, mb: 0.25, borderRadius: '12px',
          bgcolor: selected ? alpha(t.palette.primary.main, 0.12) : 'transparent',
          outline: selected ? `2px solid ${t.palette.primary.main}` : 'none', outlineOffset: -2,
          '&:hover': { bgcolor: selected ? undefined : t.palette.action.hover },
        })}
      >
        <ButtonBase
          onClick={onToggle}
          aria-pressed={selected}
          aria-label={`${f.name}, ${f.score} points`}
          sx={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1.25, textAlign: 'left', borderRadius: '10px', fontFamily: 'inherit' }}
        >
          <PersonAvatar person={f} size={36} online={online} />
          <Typography variant="body2" noWrap sx={{ fontWeight: 700, flex: 1, minWidth: 0 }}>{f.name}</Typography>
          {unread > 0 && (
            <Box component="span" aria-label={`${unread} unread`} sx={{ minWidth: 18, height: 18, px: 0.5, borderRadius: 9, bgcolor: 'error.main', color: 'error.contrastText', fontSize: 11, fontWeight: 800, display: 'grid', placeItems: 'center' }}>{unread}</Box>
          )}
          <Typography sx={{ fontWeight: 900, fontSize: 16, ...mono }}>{f.score.toLocaleString()}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: 10.5, letterSpacing: 0.4 }}>PTS</Typography>
        </ButtonBase>
        <Tooltip title="Unfriend">
          <IconButton size="small" aria-label={`Unfriend ${f.name}`} onClick={() => onUnfriend(f)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
            <PersonRemoveRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }
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
          ...(selected && { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: -2 }),
          '&::after': online ? { content: '""', position: 'absolute', inset: 0, pointerEvents: 'none', background: `linear-gradient(100deg, ${alpha(GREEN, 0.1)}, transparent 70%)`, animation: `${glow} 2.8s ease-in-out infinite`, ...calm } : undefined,
        })}
      >
        <ButtonBase
          onClick={onToggle}
          aria-expanded={compact ? undefined : expanded}
          aria-pressed={compact ? selected : undefined}
          aria-label={`${f.name}, ${f.score} points`}
          sx={(t) => ({ position: 'relative', zIndex: 1, width: '100%', display: 'grid', gridTemplateColumns: compact ? 'minmax(0,1fr) auto' : 'minmax(0,1fr) auto 20px', gap: { xs: 1, sm: 1.5 }, alignItems: 'center', textAlign: 'left', px: { xs: 1.25, sm: 2 }, py: 1.1, fontFamily: 'inherit', transition: 'background-color .15s', '&:hover': { bgcolor: t.palette.action.hover } })}
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
          {!compact && <ExpandMoreRoundedIcon sx={{ fontSize: 20, color: 'text.disabled', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />}
        </ButtonBase>

        <Collapse in={expanded && !compact} timeout={220} unmountOnExit>
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

// Dark header card: four icon tiles. Click one to switch the list below (friends / invitations / pending).
function Hero({ friends, onlineFriends, requests = 0, sent = 0, tab, onTab }) {
  const tiles = [
    ['Friends', friends, '#fff', <PeopleAltRoundedIcon key="a" sx={{ fontSize: 22 }} />, 'friends'],
    ['Online', onlineFriends, '#4ADE80', <WifiTetheringRoundedIcon key="b" sx={{ fontSize: 22 }} />, null],
    ['Invitations received', requests, requests > 0 ? '#FCA5A5' : '#fff', <MarkunreadRoundedIcon key="c" sx={{ fontSize: 22 }} />, 'requests'],
    ['Requests sent, pending', sent, '#FDE68A', <HourglassTopRoundedIcon key="d" sx={{ fontSize: 22 }} />, 'sent'],
  ];
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', flexShrink: 0, p: 1, color: '#fff', background: HERO_BG }}>
      <Box aria-hidden sx={{ position: 'absolute', right: -40, top: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.28), transparent 68%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 1 }}>
        {tiles.map(([label, n, color, icon, key]) => {
          const active = key && tab === key;
          return (
            <Tooltip key={label} title={label}>
              <ButtonBase
                onClick={key ? () => onTab(key) : undefined}
                disabled={!key}
                aria-label={`${label}: ${n}`}
                aria-pressed={key ? active : undefined}
                sx={{ py: 0.9, px: 1, gap: 0.9, borderRadius: '12px', color, bgcolor: active ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.1)', border: `1px solid ${active ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.14)'}`, fontFamily: 'inherit', cursor: key ? 'pointer' : 'default', '&.Mui-disabled': { color }, '&:hover': key ? { bgcolor: 'rgba(255,255,255,0.18)' } : undefined }}
              >
                {icon}
                <Typography sx={{ fontWeight: 900, fontSize: 20, lineHeight: 1.15, ...mono }}><CountUp value={n} /></Typography>
              </ButtonBase>
            </Tooltip>
          );
        })}
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

  const [tab, setTab] = useState('friends'); // 'friends' | 'requests' | 'sent'
  const [q, setQ] = useState('');
  const [players, setPlayers] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [inviteAnchor, setInviteAnchor] = useState(null);
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('lg'));
  const listRef = useRef(null);
  const panelRef = useRef(null);
  const zoneRef = useRef('list'); // where the last click was: 'chat' card or elsewhere ('list')
  const [panelMode, setPanelMode] = useState('chat'); // 'chat' | 'profile'
  const sentinelRef = useRef(null);
  const [shown, setShown] = useState(15); // infinite scroll: how many friends are rendered
  // The whole page is exactly one screen tall; only the friends list scrolls inside the card.
  // Bottom gap: phones leave room for the bottom nav, wider screens for the dashboard padding.
  const rootRef = useRef(null);
  const fillH = useViewportFill(rootRef, true, 340);

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

  // `stay` (desktop side panel): only send the invite; it shows up as a card inside the chat (with a Join button).
  const codeTogether = async (f, stay = false) => {
    setActing(`room:${f.userId}`);
    try {
      const { data } = await friendsApi.roomInvite(f.userId);
      enqueueSnackbar(`Invite sent to @${f.handle}`, { variant: 'success' });
      if (!stay) navigate(`/room/${data.data.roomId}`);
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

  useEffect(() => { setPanelMode('chat'); }, [chatId]);

  // Desktop: keep one friend selected so the chat box on the right is always showing someone.
  useEffect(() => {
    if (!desktop || !loaded) return;
    if (!chatId || !friends.some((f) => f.userId === chatId)) setChatId(sortedFriends[0]?.userId ?? null);
  }, [desktop, loaded, chatId, friends]); // eslint-disable-line react-hooks/exhaustive-deps

  const friendRow = (f, i) => (
    <FriendRow
      key={f.userId}
      f={f}
      index={i}
      unread={unread[f.userId]}
      online={Boolean(online[f.userId])}
      expanded={openRow === f.userId}
      compact={desktop}
      selected={desktop && chatId === f.userId}
      onToggle={() => (desktop ? setChatId(f.userId) : setOpenRow((cur) => (cur === f.userId ? null : f.userId)))}
      {...rowProps}
    />
  );
  const rowProps = { onProfile: setProfileId, onChat: (f) => setChatId(f.userId), onCode: (f) => codeTogether(f), onNudge: nudge, onUnfriend: setConfirm, busy: acting };

  // Infinite scroll: render more friends when the bottom sentinel comes into view.
  useEffect(() => { setShown(15); }, [tab, needle]);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || shown >= sortedFriends.length) return undefined;
    const io = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) setShown((n) => n + 15); }, { root: listRef.current, rootMargin: '0px 0px 160px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [shown, sortedFriends.length, desktop, tab, needle]);

  // Arrow keys move the selected friend (chat on the right follows).
  const navIds = tab === 'friends' || needle ? (needle ? friends.filter((f) => f.name.toLowerCase().includes(needle) || f.handle.includes(needle)) : sortedFriends).map((f) => f.userId) : [];
  const navKey = navIds.join(',');
  useEffect(() => {
    const onDown = (e) => { zoneRef.current = panelRef.current?.contains(e.target) ? 'chat' : 'list'; };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, []);
  useEffect(() => {
    if (!desktop || navIds.length === 0) return undefined;
    const onKey = (e) => {
      if ((e.key !== 'ArrowDown' && e.key !== 'ArrowUp') || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || e.defaultPrevented) return;
      const a = document.activeElement;
      if (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable || a.closest?.('[role="dialog"],[role="menu"],[role="listbox"]'))) return;
      if (document.querySelector('.MuiModal-root')) return;
      // Last click was inside the chat card: the arrows scroll the chat (or profile). Anywhere else: they move through friends.
      if (zoneRef.current === 'chat') {
        const sc = [...(panelRef.current?.querySelectorAll('[data-chat-scroll]') || [])].find((el) => el.offsetParent !== null);
        if (sc) {
          e.preventDefault();
          sc.scrollBy({ top: e.key === 'ArrowDown' ? 90 : -90, behavior: 'smooth' });
          return;
        }
      }
      e.preventDefault();
      const i = navIds.indexOf(chatId);
      const next = navIds[Math.min(navIds.length - 1, Math.max(0, i < 0 ? 0 : i + (e.key === 'ArrowDown' ? 1 : -1)))];
      if (!next) return;
      setChatId(next);
      setShown((n) => Math.max(n, navIds.indexOf(next) + 6));
      requestAnimationFrame(() => listRef.current?.querySelector(`[data-fid="${next}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [desktop, navKey, chatId]); // eslint-disable-line react-hooks/exhaustive-deps

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
        {sortedFriends.slice(0, shown).map((f, i) => friendRow(f, i))}
        {shown < sortedFriends.length && <Box ref={sentinelRef} aria-hidden sx={{ height: 1 }} />}
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
    <Stack
      ref={rootRef}
      spacing={1.5}
      sx={fillH ? { height: { xs: `calc(${fillH}px - 92px - env(safe-area-inset-bottom))`, md: `calc(${fillH}px - 24px)` } } : { minHeight: 480 }}
    >
      {inviteHandle && <InviteBanner handle={inviteHandle} onDone={onClearInvite} />}

      <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gap: 2, gridTemplateColumns: desktop ? 'minmax(0, 1fr) 380px' : 'minmax(0, 1fr)', gridTemplateRows: 'minmax(0, 1fr)' }}>
      {/* One card: stats tabs on top, search under them, the list fills the rest. */}
      <Box sx={[surface, { overflow: 'hidden', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }]}>
        <Hero friends={friends.length} onlineFriends={onlineFriends.length} requests={incoming.length} sent={outgoing.length} tab={tab} onTab={(k) => { setQ(''); setTab(k); }} />

        {/* toolbar: search + invite + leaderboard */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1.25, flexShrink: 0 }}>
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

        {error && (
          <Alert severity="error" sx={{ mx: 1.25, mb: 1.25 }} action={<Button color="inherit" onClick={() => dispatch(fetchFriends())}>Retry</Button>}>{error}</Alert>
        )}

        <Box
          ref={listRef}
          sx={(t) => ({
            borderTop: `1px solid ${t.palette.divider}`, pt: 1, pb: 0.25,
            flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', scrollBehavior: 'smooth', scrollbarWidth: 'thin',
          })}
        >
          {body}
        </Box>
      </Box>

      {/* Desktop side panel: the chat is always open for the selected friend, with every action as an icon. */}
      {desktop && (
        <Box ref={panelRef} sx={[surface, { minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }]}>
          {chatFriend ? (
            <ChatPanel
              key={chatFriend.userId}
              friend={chatFriend}
              onCodeTogether={() => { setPanelMode('chat'); codeTogether(chatFriend, true); }}
              overlay={panelMode === 'profile' ? <FriendProfilePanel f={chatFriend} onRemove={() => setConfirm(chatFriend)} /> : null}
              actions={
                <>
                  {!practisedToday(chatFriend) && (
                    <Tooltip title="Nudge: remind about streak">
                      <span>
                        <IconButton aria-label="Nudge" disabled={acting === `nudge:${chatFriend.userId}`} onClick={() => { setPanelMode('chat'); nudge(chatFriend); }} sx={{ width: 40, height: 40, color: FLAME, bgcolor: alpha(FLAME, 0.14), '&:hover': { bgcolor: alpha(FLAME, 0.24) } }}>
                          <LocalFireDepartmentRoundedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                  <Tooltip title="Profile & compare">
                    <IconButton aria-label="Profile and compare" aria-pressed={panelMode === 'profile'} onClick={() => setPanelMode((m) => (m === 'profile' ? 'chat' : 'profile'))} sx={{ width: 40, height: 40, bgcolor: panelMode === 'profile' ? 'primary.main' : 'action.hover', color: panelMode === 'profile' ? 'primary.contrastText' : 'inherit', '&:hover': { bgcolor: panelMode === 'profile' ? 'primary.dark' : undefined } }}>
                      <BadgeRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </>
              }
            />
          ) : (
            <Box sx={{ m: 'auto' }}>
              <Note icon={<ChatRoundedIcon sx={{ fontSize: 34 }} />}>{loaded && friends.length === 0 ? 'Add a friend to start chatting.' : 'Pick a friend to chat.'}</Note>
            </Box>
          )}
        </Box>
      )}
      </Box>

      {/* invite menu */}
      <Menu anchorEl={inviteAnchor} open={Boolean(inviteAnchor)} onClose={closeInvite}>
        <MenuItem onClick={copy} sx={{ minHeight: 46 }}><ListItemIcon><ContentCopyRoundedIcon fontSize="small" /></ListItemIcon>Copy link</MenuItem>
        <MenuItem onClick={share} sx={{ minHeight: 46 }}><ListItemIcon><IosShareRoundedIcon fontSize="small" /></ListItemIcon>Share…</MenuItem>
        <MenuItem component="a" href={`https://wa.me/?text=${encodeURIComponent(`${message} ${link}`)}`} target="_blank" rel="noopener noreferrer" onClick={closeInvite} sx={{ minHeight: 46 }}>
          <ListItemIcon><WhatsAppIcon fontSize="small" /></ListItemIcon>WhatsApp
        </MenuItem>
      </Menu>

      {profile && !desktop && (
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

      {!desktop && <FriendChat friend={chatFriend} onClose={() => setChatId(null)} onCodeTogether={codeTogether} />}

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
