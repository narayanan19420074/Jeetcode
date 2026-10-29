import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputAdornment, ListItemIcon, Menu, MenuItem,
  Skeleton, Stack, TextField, Tooltip, Typography, alpha, useMediaQuery, useTheme,
} from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ScheduleSendRoundedIcon from '@mui/icons-material/ScheduleSendRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import MarkunreadRoundedIcon from '@mui/icons-material/MarkunreadRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import WifiTetheringRoundedIcon from '@mui/icons-material/WifiTetheringRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { surface } from '../dashboard/dashboardUtils';
import useViewportFill from '../dashboard/useViewportFill';
import BackToDashboard from '../../components/BackToDashboard';
import { WS } from '../workspace/wsTokens';
import { wsSurface } from '../workspace/workspaceTheme';
import { WsIconButton } from '../workspace/wsUi';
import {
  acceptFriendInvite, acceptFriendRequest, cancelFriendRequest, declineFriendRequest, fetchChatOverview, fetchFriends, removeFriend, sendFriendRequest,
} from './friendsSlice';
import { FLAME, PersonAvatar, practisedToday, timeAgo } from './friendsUi';
import { EmptyNote, FilterChip, FriendRow, LiveLine, OnlineRail, PersonRow, Reveal, SectionLabel, SkeletonRows, TabBar, useFavourites } from './friendsKit';
import useGlobalPlayers from './useGlobalPlayers';
import ActivityFeed from './ActivityFeed';
import FriendChat, { ChatPanel } from './FriendChat';
import MobileFriends, { MobileShell } from './MobileFriends';
import { FriendProfilePanel } from './FriendProfileDialog';

const SORTS = [['recent', 'Recent chats'], ['online', 'Online first'], ['points', 'Most points'], ['name', 'Name A to Z']];
const REQUEST_TABS = ['friends', 'requests', 'sent'];

// Soft tonal pill button used for "Add friend", "Accept" and friends' small actions.
const pillBtn = (color) => (t) => ({
  height: 32, px: 1.5, flexShrink: 0, borderRadius: `${WS.radius + 2}px`, fontSize: 12.5, fontWeight: 700, textTransform: 'none', whiteSpace: 'nowrap',
  color: t.palette[color].main, bgcolor: alpha(t.palette[color].main, 0.12), transition: 'background-color .18s, transform .12s',
  '&:hover': { bgcolor: alpha(t.palette[color].main, 0.22) },
  '&:active': { transform: 'scale(0.96)' },
});

// Round icon-only action (accept / decline / cancel) with a tinted background.
const tint = (color) => (t) => ({
  width: 36, height: 36,
  color: color ? t.palette[color].main : t.palette.text.secondary,
  bgcolor: alpha(color ? t.palette[color].main : t.palette.text.primary, color ? 0.12 : 0.06),
  '&:hover': { bgcolor: alpha(color ? t.palette[color].main : t.palette.text.primary, color ? 0.22 : 0.12), color: color ? t.palette[color].main : t.palette.text.primary },
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

// ?invite=handle: someone shared their link with me. One slim row: accept or dismiss.
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

  if (state.loading) return <Skeleton variant="rounded" height={60} sx={{ borderRadius: '14px' }} />;
  if (state.error) return <Alert severity="warning" onClose={onDone}>{state.error}</Alert>;
  if (state.isSelf) return <Alert severity="info" onClose={onDone}>This is your own invite link.</Alert>;
  if (state.relation === 'friends') return <Alert severity="success" onClose={onDone}>You and @{state.user.handle} are already friends.</Alert>;

  const accept = async () => {
    if (await run('invite', acceptFriendInvite(handle), `You and @${handle} are now friends`)) onDone();
  };

  return (
    <Reveal>
      <Box sx={[surface, (t) => ({ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, borderColor: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.06) })]}>
        <PersonAvatar person={state.user} size={38} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.35 }}>{state.user.name}</Typography>
          <Typography noWrap sx={{ fontSize: 12.5, color: 'text.secondary' }}>invited you to be friends</Typography>
        </Box>
        <WsIconButton title="Accept" disabled={busy === 'invite'} onClick={accept} sx={tint('success')}><CheckRoundedIcon /></WsIconButton>
        <WsIconButton title="Not now" onClick={onDone} sx={tint()}><CloseRoundedIcon /></WsIconButton>
      </Box>
    </Reveal>
  );
}

function FriendsPanel({ user, inviteHandle, onClearInvite, onOpenLeaderboard }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const { friends, incoming, outgoing, loaded, loading, error, online, unread, last } = useSelector((s) => s.friends);
  const { busy, run } = useFriendAction();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('lg'));
  const phone = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const { favs, toggle: toggleFav } = useFavourites(user.id);

  const [view, setView] = useState('friends'); // 'friends' | 'requests' | 'sent' | 'activity' | 'find'
  const [filter, setFilter] = useState('all'); // 'all' | 'online'
  const [sortBy, setSortBy] = useState('recent');
  const [q, setQ] = useState('');
  const [chatId, setChatId] = useState(null);
  const [panelMode, setPanelMode] = useState('chat'); // 'chat' | 'profile'
  const [acting, setActing] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [inviteAnchor, setInviteAnchor] = useState(null);
  const [sortAnchor, setSortAnchor] = useState(null);

  const rootRef = useRef(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);
  // The whole page is exactly one screen tall; only the list and the chat scroll inside the card.
  const fillH = useViewportFill(rootRef, true, 340);

  const needle = q.trim().toLowerCase().replace(/^@/, '');
  const noFriends = loaded && friends.length === 0;
  const globalOn = view === 'find' || (view === 'friends' && (noFriends || needle.length >= 2));
  const global = useGlobalPlayers({ enabled: globalOn, q: needle });

  const friendIds = useMemo(() => new Set(friends.map((f) => f.userId)), [friends]);
  const sentIds = useMemo(() => new Set(outgoing.map((o) => o.user.userId)), [outgoing]);
  const received = useMemo(() => new Map(incoming.map((i) => [i.user.userId, i.requestId])), [incoming]);
  const chatFriend = friends.find((f) => f.userId === chatId) || null;

  // preview lines for the chat list
  useEffect(() => { dispatch(fetchChatOverview()); }, [dispatch, friends.length]);

  const isOnline = (f) => Boolean(online[f.userId]);
  const onlineFriends = friends.filter(isOnline);
  const onlineCount = onlineFriends.length;

  const nameMatch = (p) => !needle || p.name.toLowerCase().includes(needle) || p.handle.toLowerCase().includes(needle);

  const shownFriends = useMemo(() => {
    const lastAt = (f) => (last[f.userId]?.at ? Date.parse(last[f.userId].at) : 0);
    const on = (f) => Number(Boolean(online[f.userId]));
    const cmp = {
      recent: (a, b) => lastAt(b) - lastAt(a) || on(b) - on(a) || b.score - a.score,
      online: (a, b) => on(b) - on(a) || b.score - a.score,
      points: (a, b) => b.score - a.score,
      name: (a, b) => a.name.localeCompare(b.name),
    }[sortBy];
    return friends
      .filter((f) => (filter === 'online' ? on(f) : true) && (!needle || f.name.toLowerCase().includes(needle) || f.handle.toLowerCase().includes(needle)))
      .sort((a, b) => Number(favs.has(b.userId)) - Number(favs.has(a.userId)) || cmp(a, b) || a.handle.localeCompare(b.handle));
  }, [friends, filter, sortBy, needle, online, last, favs]);

  // /dashboard?view=friends&chat=<id> (from a notification toast) opens that chat
  const chatParam = params.get('chat');
  useEffect(() => {
    if (chatParam && friends.some((f) => f.userId === chatParam)) {
      setView('friends');
      setChatId(chatParam);
      const next = new URLSearchParams(params);
      next.delete('chat');
      setParams(next, { replace: true });
    }
  }, [chatParam, friends, params, setParams]);

  useEffect(() => { setPanelMode('chat'); }, [chatId]);

  // Desktop: keep one friend selected so the chat on the right always shows someone.
  useEffect(() => {
    if (!desktop || !loaded) return;
    if (!chatId || !friends.some((f) => f.userId === chatId)) setChatId(shownFriends[0]?.userId ?? friends[0]?.userId ?? null);
  }, [desktop, loaded, chatId, friends]); // eslint-disable-line react-hooks/exhaustive-deps

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
      enqueueSnackbar(`Nudge sent to @${f.handle}`, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'info' });
    } finally {
      setActing('');
    }
  };

  const openChat = (id) => {
    setView('friends');
    setChatId(id);
  };

  // Up / Down inside the list moves to the next friend (the chat on the right follows).
  const onListKey = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const row = e.target.closest?.('[data-fid]');
    if (!row || !listRef.current) return;
    const rows = [...listRef.current.querySelectorAll('[data-fid]')];
    const next = rows[rows.indexOf(row) + (e.key === 'ArrowDown' ? 1 : -1)];
    if (!next) return;
    e.preventDefault();
    next.querySelector('button')?.focus();
    if (desktop) setChatId(next.dataset.fid);
  };

  const link = `${window.location.origin}/dashboard?view=friends&invite=${user.handle}`;
  const message = `Join me on JeetCode! I'm @${user.handle}. Add me as a friend and let's compete on the leaderboard.`;
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

  const goView = (next, nextFilter = 'all') => {
    setView(next);
    setFilter(nextFilter);
    setQ('');
  };
  const toggleView = (next) => goView(view === next ? 'friends' : next);

  // ---- action cell for a player who is not a friend (or is, in the find list)
  const playerAction = (p) => {
    if (friendIds.has(p.userId)) {
      return <WsIconButton title="Chat" onClick={() => openChat(p.userId)} sx={tint('primary')}><ChatRoundedIcon /></WsIconButton>;
    }
    if (sentIds.has(p.userId)) {
      return (
        <Tooltip title="Waiting for them to accept">
          <Box component="span" sx={(t) => ({ display: 'inline-flex', alignItems: 'center', gap: 0.6, height: 32, px: 1.25, borderRadius: `${WS.radius + 2}px`, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', color: 'text.secondary', bgcolor: wsSurface(t).raised, '& svg': { fontSize: 16 } })}>
            <ScheduleSendRoundedIcon />Request sent
          </Box>
        </Tooltip>
      );
    }
    if (received.has(p.userId)) {
      return (
        <Button size="small" disableElevation disabled={busy === p.userId} onClick={() => run(p.userId, acceptFriendRequest(received.get(p.userId)), 'Friend added')} startIcon={<CheckRoundedIcon sx={{ fontSize: '17px !important' }} />} sx={pillBtn('success')}>
          Accept
        </Button>
      );
    }
    return (
      <Button
        size="small"
        disableElevation
        disabled={busy === p.userId}
        onClick={() => run(p.userId, sendFriendRequest(p.handle), 'Friend request sent')}
        startIcon={<PersonAddAlt1RoundedIcon sx={{ fontSize: '17px !important' }} />}
        sx={pillBtn('primary')}
      >
        Add friend
      </Button>
    );
  };

  const players = (global.rows || []).filter((p) => p.userId !== user.id && (view === 'find' || !friendIds.has(p.userId)));
  const playerRows = (withRank) => players.map((p, i) => (
    <Reveal key={p.userId} index={i}>
      <PersonRow person={p} rank={withRank ? p.rank : null} sub={`@${p.handle} · ${p.score.toLocaleString()} pts`} action={playerAction(p)} />
    </Reveal>
  ));
  const playerFooter = (
    <>
      {global.rows === null && global.loading && <SkeletonRows count={5} />}
      {global.error && <Typography sx={{ px: 2, py: 1.25, fontSize: 13, color: 'text.secondary' }}>{global.error}</Typography>}
      {global.hasMore && (
        <Box sx={{ textAlign: 'center', py: 1.5 }}>
          <Button size="small" onClick={global.loadMore} disabled={global.loading} sx={{ textTransform: 'none', fontWeight: 600 }}>{global.loading ? 'Loading…' : 'Show more players'}</Button>
        </Box>
      )}
    </>
  );

  // ---- what to show under the toolbar
  let body;
  if (view === 'find') {
    body = (
      <>
        <SectionLabel>{needle ? 'Search results' : 'Top players'}</SectionLabel>
        {playerRows(true)}
        {global.rows && players.length === 0 && !global.loading && !global.error && <EmptyNote icon={<SearchRoundedIcon />} title="No player found">{needle ? `Nobody matches “${needle}”. Check the spelling or try their @handle.` : 'No players to show yet.'}</EmptyNote>}
        {playerFooter}
      </>
    );
  } else if (view === 'activity') {
    body = <ActivityFeed />;
  } else if (view === 'requests') {
    const rows = incoming.filter((r) => nameMatch(r.user));
    body = (
      <>
        <SectionLabel right={rows.length > 0 ? <Typography sx={{ fontSize: 12, color: 'text.disabled', fontWeight: 600 }}>{rows.length}</Typography> : null}>Friend requests</SectionLabel>
        {rows.length === 0 && <EmptyNote icon={<MarkunreadRoundedIcon />} title="No friend requests">When someone sends you a request, it shows up here.</EmptyNote>}
        {rows.map((r, i) => (
          <Reveal key={r.requestId} index={i}>
            <PersonRow
              person={r.user}
              sub={`@${r.user.handle} · ${timeAgo(r.createdAt)}`}
              action={(
                <Stack direction="row" spacing={0.75}>
                  <WsIconButton title="Accept request" disabled={busy === r.requestId} onClick={() => run(r.requestId, acceptFriendRequest(r.requestId), 'Friend added')} sx={tint('success')}><CheckRoundedIcon /></WsIconButton>
                  <WsIconButton title="Decline request" disabled={busy === r.requestId} onClick={() => run(r.requestId, declineFriendRequest(r.requestId), 'Request declined')} sx={tint()}><CloseRoundedIcon /></WsIconButton>
                </Stack>
              )}
            />
          </Reveal>
        ))}
      </>
    );
  } else if (view === 'sent') {
    const rows = outgoing.filter((r) => nameMatch(r.user));
    body = (
      <>
        <SectionLabel right={rows.length > 0 ? <Typography sx={{ fontSize: 12, color: 'text.disabled', fontWeight: 600 }}>{rows.length}</Typography> : null}>Sent requests</SectionLabel>
        {rows.length === 0 && <EmptyNote icon={<ScheduleSendRoundedIcon />} title="No sent requests">Requests you send wait here until the other person accepts.</EmptyNote>}
        {rows.map((r, i) => (
          <Reveal key={r.requestId} index={i}>
            <PersonRow
              person={r.user}
              sub={`@${r.user.handle} · request sent ${timeAgo(r.createdAt)}`}
              action={<WsIconButton title="Cancel request" disabled={busy === r.requestId} onClick={() => run(r.requestId, cancelFriendRequest(r.requestId), 'Request cancelled')} sx={tint()}><CloseRoundedIcon /></WsIconButton>}
            />
          </Reveal>
        ))}
      </>
    );
  } else {
    const showRail = filter === 'all' && !needle && onlineCount > 0;
    body = (
      <>
        {error && <Alert severity="error" sx={{ mx: 2, my: 1.5 }} action={<Button color="inherit" onClick={() => dispatch(fetchFriends())}>Retry</Button>}>{error}</Alert>}
        {!loaded && loading && <SkeletonRows />}
        {showRail && (
          <>
            <SectionLabel>Online now</SectionLabel>
            <OnlineRail people={onlineFriends} onOpen={setChatId} />
            <SectionLabel>All friends</SectionLabel>
          </>
        )}
        {!showRail && shownFriends.length > 0 && <Box sx={{ height: 8 }} />}
        {shownFriends.map((f, i) => (
          <Reveal key={f.userId} index={i}>
            <FriendRow
              f={f}
              last={last[f.userId]}
              myId={user.id}
              online={isOnline(f)}
              unread={unread[f.userId]}
              selected={desktop && chatId === f.userId}
              fav={favs.has(f.userId)}
              canNudge={!practisedToday(f)}
              nudging={acting === `nudge:${f.userId}`}
              coding={acting === `room:${f.userId}`}
              onOpen={() => setChatId(f.userId)}
              onFav={() => toggleFav(f.userId)}
              onNudge={() => nudge(f)}
              onCode={() => codeTogether(f, desktop)}
              onRemove={() => setConfirm(f)}
            />
          </Reveal>
        ))}
        {loaded && friends.length > 0 && shownFriends.length === 0 && !needle && (
          <EmptyNote icon={<WifiTetheringRoundedIcon />} title="Nobody is online">Friends show up here as soon as they are active on JeetCode.</EmptyNote>
        )}
        {noFriends && !needle && (
          <>
            <EmptyNote icon={<PeopleAltRoundedIcon />} title="No friends yet">Add someone from the list below, or share your invite link with the share icon above.</EmptyNote>
            <SectionLabel>Players you can add</SectionLabel>
          </>
        )}
        {needle.length >= 2 && friends.length > 0 && <SectionLabel>Other players</SectionLabel>}
        {globalOn && playerRows(noFriends && !needle)}
        {globalOn && playerFooter}
        {needle && shownFriends.length === 0 && global.rows && players.length === 0 && !global.loading && <EmptyNote icon={<SearchRoundedIcon />} title="No one found">{needle.length < 2 ? 'Type at least 2 letters.' : `Nobody matches “${needle}”.`}</EmptyNote>}
      </>
    );
  }

  // ---- chat header icons (desktop panel and phone drawer share them)
  const chatActions = (f) => (
    <>
      {!practisedToday(f) && (
        <WsIconButton title="Nudge: remind about streak" disabled={acting === `nudge:${f.userId}`} onClick={() => { setPanelMode('chat'); nudge(f); }} sx={{ color: FLAME }}>
          <LocalFireDepartmentRoundedIcon />
        </WsIconButton>
      )}
      <WsIconButton title="Profile & compare" active={panelMode === 'profile'} onClick={() => setPanelMode((m) => (m === 'profile' ? 'chat' : 'profile'))}><BadgeRoundedIcon /></WsIconButton>
      <WsIconButton title="Remove friend" onClick={() => setConfirm(f)} sx={{ '&:hover': { color: 'error.main' } }}><PersonRemoveRoundedIcon /></WsIconButton>
    </>
  );
  const chatOverlay = (f) => (panelMode === 'profile' ? <FriendProfilePanel f={f} onRemove={() => setConfirm(f)} /> : null);

  const showChips = view === 'friends' && friends.length > 0;
  const showSearch = view !== 'activity';
  const iconSize = desktop ? 'md' : 'lg';

  const title = view === 'find' ? 'Find players' : view === 'activity' ? 'Friend activity' : 'Friends';
  const subtitle = view === 'find'
    ? 'Search every player on JeetCode'
    : view === 'activity'
      ? 'What your friends solved lately'
      : `${friends.length} ${friends.length === 1 ? 'friend' : 'friends'}${onlineCount ? ` · ${onlineCount} online` : ''}`;

  const tabs = [
    { key: 'friends', label: 'Friends', title: 'Friends', icon: <PeopleAltRoundedIcon />, count: friends.length },
    { key: 'requests', label: 'Requests', title: 'Friend requests', icon: <MarkunreadRoundedIcon />, count: incoming.length, badge: '#EF4444' },
    { key: 'sent', label: 'Sent', title: 'Sent requests', icon: <ScheduleSendRoundedIcon />, count: outgoing.length, badge: '#F59E0B' },
  ];

  const overlays = (
    <>
      {/* invite menu */}
      <Menu anchorEl={inviteAnchor} open={Boolean(inviteAnchor)} onClose={closeInvite}>
        <MenuItem onClick={copy} sx={{ minHeight: 44 }}><ListItemIcon><ContentCopyRoundedIcon fontSize="small" /></ListItemIcon>Copy link</MenuItem>
        <MenuItem onClick={share} sx={{ minHeight: 44 }}><ListItemIcon><IosShareRoundedIcon fontSize="small" /></ListItemIcon>Share…</MenuItem>
        <MenuItem component="a" href={`https://wa.me/?text=${encodeURIComponent(`${message} ${link}`)}`} target="_blank" rel="noopener noreferrer" onClick={closeInvite} sx={{ minHeight: 44 }}>
          <ListItemIcon><WhatsAppIcon fontSize="small" /></ListItemIcon>WhatsApp
        </MenuItem>
      </Menu>

      {/* sort menu */}
      <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)}>
        {SORTS.map(([key, label]) => (
          <MenuItem key={key} selected={sortBy === key} onClick={() => { setSortBy(key); setSortAnchor(null); }} sx={{ minHeight: 42, fontSize: 14 }}>
            <ListItemIcon>{sortBy === key ? <CheckCircleRoundedIcon fontSize="small" color="primary" /> : null}</ListItemIcon>{label}
          </MenuItem>
        ))}
      </Menu>

      {/* phone / tablet: chat opens as a full-height drawer */}
      {!desktop && (
        <FriendChat
          friend={chatFriend}
          onClose={() => setChatId(null)}
          onCodeTogether={(f) => codeTogether(f)}
          actions={chatFriend ? chatActions(chatFriend) : null}
          overlay={chatFriend ? chatOverlay(chatFriend) : null}
        />
      )}

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
                if (chatId === confirm.userId) setChatId(null);
                setConfirm(null);
              }
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  // Phone: its own layout (same look as the phone Problems, Store and Contest pages). The chat still opens in its drawer.
  if (phone) {
    return (
      <MobileShell>
        <MobileFriends
          inviteHandle={inviteHandle}
          onClearInvite={onClearInvite}
          run={run}
          busy={busy}
          onOpenLeaderboard={onOpenLeaderboard}
          view={view}
          goView={goView}
          filter={filter}
          setFilter={setFilter}
          q={q}
          setQ={setQ}
          title={title}
          subtitle={subtitle}
          friends={friends}
          incoming={incoming}
          outgoing={outgoing}
          loaded={loaded}
          loading={loading}
          error={error}
          onRetry={() => dispatch(fetchFriends())}
          online={online}
          unread={unread}
          last={last}
          favs={favs}
          myId={user.id}
          shownFriends={shownFriends}
          onlineFriends={onlineFriends}
          onlineCount={onlineCount}
          needle={needle}
          noFriends={noFriends}
          globalOn={globalOn}
          global={global}
          players={players}
          friendIds={friendIds}
          sentIds={sentIds}
          received={received}
          nameMatch={nameMatch}
          onOpenChat={openChat}
          onFind={() => toggleView('find')}
          onAdd={(p) => run(p.userId, sendFriendRequest(p.handle), 'Friend request sent')}
          onAccept={(requestId, key) => run(key, acceptFriendRequest(requestId), 'Friend added')}
          onDecline={(id) => run(id, declineFriendRequest(id), 'Request declined')}
          onCancel={(id) => run(id, cancelFriendRequest(id), 'Request cancelled')}
          onInvite={setInviteAnchor}
          onSort={setSortAnchor}
          onActivity={() => toggleView('activity')}
        />
        {overlays}
      </MobileShell>
    );
  }

  return (
    <Stack
      ref={rootRef}
      spacing={2}
      sx={fillH ? { height: { xs: `calc(${fillH}px - 92px - env(safe-area-inset-bottom))`, md: `calc(${fillH}px - 24px)` } } : { minHeight: 480 }}
    >
      {inviteHandle && <InviteBanner handle={inviteHandle} onDone={onClearInvite} />}

      <Box sx={[surface, { flex: 1, minHeight: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: desktop ? '380px minmax(0, 1fr)' : 'minmax(0, 1fr)', gridTemplateRows: 'minmax(0, 1fr)' }]}>
        {/* ---------------- left: friends / requests / find */}
        <Box sx={(t) => ({ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', borderRight: desktop ? `1px solid ${t.palette.divider}` : 'none' })}>
          {/* header: title + live count, quick icons */}
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minHeight: 68, px: 2, pt: 1.5, pb: 1, flexShrink: 0 }}>
            <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
              <motion.div key={title} initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <Typography noWrap sx={{ fontWeight: 800, fontSize: 19, lineHeight: 1.25, letterSpacing: -0.3 }}>{title}</Typography>
              </motion.div>
              <LiveLine text={subtitle} online={view === 'find' || view === 'activity' ? 0 : onlineCount} />
            </Box>
            <WsIconButton title="Find players" size={iconSize} active={view === 'find'} onClick={() => { toggleView('find'); setTimeout(() => searchRef.current?.focus(), 0); }}><PersonAddAlt1RoundedIcon /></WsIconButton>
            <WsIconButton title="Invite with link" size={iconSize} onClick={(e) => setInviteAnchor(e.currentTarget)}><IosShareRoundedIcon /></WsIconButton>
            <WsIconButton title="Friend activity" size={iconSize} active={view === 'activity'} onClick={() => toggleView('activity')}><TimelineRoundedIcon /></WsIconButton>
            <WsIconButton title="Friends leaderboard" size={iconSize} onClick={onOpenLeaderboard}><LeaderboardRoundedIcon /></WsIconButton>
          </Stack>

          {/* Friends / Friend requests / Sent requests, each with its own icon and count */}
          <Box sx={{ px: 2, pb: 1.5, flexShrink: 0 }}>
            <TabBar items={tabs} value={REQUEST_TABS.includes(view) ? view : ''} onChange={(key) => goView(key)} />
          </Box>

          {showSearch && (
            <Box sx={{ px: 2, pb: 1.5, flexShrink: 0 }}>
              <TextField
                fullWidth
                size="small"
                inputRef={searchRef}
                placeholder={view === 'find' ? 'Search all players by name or @handle' : 'Search by name or @handle'}
                value={q}
                onChange={(e) => setQ(e.target.value.slice(0, 40))}
                sx={(t) => ({
                  '& .MuiOutlinedInput-root': { height: 42, borderRadius: '12px', bgcolor: wsSurface(t).raised, fontSize: 14, transition: 'box-shadow .18s' },
                  '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: `0 0 0 2px ${alpha(t.palette.primary.main, 0.45)}` },
                  '& fieldset': { border: 'none' },
                })}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 20 }} /></InputAdornment>,
                    endAdornment: q ? (
                      <InputAdornment position="end">
                        <WsIconButton title="Clear search" onClick={() => setQ('')} sx={{ width: 26, height: 26 }}><CloseRoundedIcon sx={{ fontSize: '16px !important' }} /></WsIconButton>
                      </InputAdornment>
                    ) : null,
                  },
                  htmlInput: { 'aria-label': 'Search friends or players', autoCapitalize: 'none', autoCorrect: 'off' },
                }}
              />
            </Box>
          )}

          {showChips && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 2, pb: 1.5, flexShrink: 0 }}>
              <FilterChip label="All" count={friends.length} active={filter === 'all'} onClick={() => setFilter('all')} />
              <FilterChip label="Online" dot count={onlineCount} active={filter === 'online'} onClick={() => setFilter('online')} />
              <Box sx={{ flex: 1 }} />
              <WsIconButton title="Sort" onClick={(e) => setSortAnchor(e.currentTarget)}><SortRoundedIcon /></WsIconButton>
            </Stack>
          )}

          <Box
            ref={listRef}
            className="autohide-scroll"
            onKeyDown={onListKey}
            sx={(t) => ({ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', borderTop: `1px solid ${t.palette.divider}`, pb: 2 })}
          >
            <motion.div key={`${view}:${filter}`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
              {body}
            </motion.div>
          </Box>
        </Box>

        {/* ---------------- right: the chat (desktop) */}
        {desktop && (
          <Box sx={(t) => ({ minWidth: 0, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: wsSurface(t).panel })}>
            {chatFriend ? (
              <ChatPanel
                key={chatFriend.userId}
                friend={chatFriend}
                onCodeTogether={() => { setPanelMode('chat'); codeTogether(chatFriend, true); }}
                overlay={chatOverlay(chatFriend)}
                actions={chatActions(chatFriend)}
              />
            ) : (
              <Box sx={{ m: 'auto' }}>
                <EmptyNote icon={<ChatRoundedIcon />} title={noFriends ? 'No chats yet' : 'Your messages'}>
                  {noFriends ? 'Add a player from the list and your chat will open here.' : 'Pick a friend on the left to start chatting.'}
                </EmptyNote>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {overlays}
    </Stack>
  );
}

export default function FriendsView({ isAuthenticated, user, inviteHandle, onClearInvite, onOpenLeaderboard }) {
  const navigate = useNavigate();
  const phone = useMediaQuery(useTheme().breakpoints.down('md'), { noSsr: true });

  if (!isAuthenticated) {
    const card = (
      <Box sx={[surface, { p: 4, textAlign: 'center' }]}>
        <PeopleAltRoundedIcon sx={{ fontSize: 36, color: 'primary.main' }} />
        <Typography sx={{ fontWeight: 800, mt: 1 }}>Compete with friends</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 2.5 }}>
          {inviteHandle ? `@${inviteHandle} invited you. Log in or sign up to accept.` : 'Log in to add friends and see them on the leaderboard.'}
        </Typography>
        <Button variant="contained" disableElevation onClick={() => navigate('/login', { state: { from: { pathname: '/dashboard' } } })} sx={{ height: 40, px: 3 }}>
          Log in
        </Button>
      </Box>
    );
    return phone ? (
      <MobileShell>
        <BackToDashboard sx={{ width: 44, height: 44, border: 'none', bgcolor: 'transparent', mb: 1 }} />
        {card}
      </MobileShell>
    ) : card;
  }
  return <FriendsPanel user={user} inviteHandle={inviteHandle} onClearInvite={onClearInvite} onOpenLeaderboard={onOpenLeaderboard} />;
}
