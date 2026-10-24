import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputAdornment, ListItemIcon, Menu, MenuItem,
  Skeleton, Stack, TextField, Tooltip, Typography, alpha, useMediaQuery, useTheme,
} from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
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
import { WS } from '../workspace/wsTokens';
import { wsSurface } from '../workspace/workspaceTheme';
import { WsIconButton } from '../workspace/wsUi';
import {
  acceptFriendInvite, acceptFriendRequest, cancelFriendRequest, declineFriendRequest, fetchChatOverview, fetchFriends, removeFriend, sendFriendRequest,
} from './friendsSlice';
import { FLAME, GREEN, PersonAvatar, mono, practisedToday, timeAgo } from './friendsUi';
import { EmptyNote, FilterChip, FriendRow, PersonRow, ScopeSwitch, SectionLabel, SkeletonRows, StatCard, useFavourites } from './friendsKit';
import useGlobalPlayers from './useGlobalPlayers';
import ActivityFeed from './ActivityFeed';
import FriendChat, { ChatPanel } from './FriendChat';
import { FriendProfilePanel } from './FriendProfileDialog';

const SORTS = [['recent', 'Recent chats'], ['online', 'Online first'], ['points', 'Most points'], ['name', 'Name A to Z']];
const hideScroll = { overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } };

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

  if (state.loading) return <Skeleton variant="rounded" height={52} sx={{ borderRadius: '12px' }} />;
  if (state.error) return <Alert severity="warning" onClose={onDone}>{state.error}</Alert>;
  if (state.isSelf) return <Alert severity="info" onClose={onDone}>This is your own invite link.</Alert>;
  if (state.relation === 'friends') return <Alert severity="success" onClose={onDone}>You and @{state.user.handle} are already friends.</Alert>;

  const accept = async () => {
    if (await run('invite', acceptFriendInvite(handle), `You and @${handle} are now friends`)) onDone();
  };

  return (
    <Box sx={[surface, (t) => ({ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 0.9, borderColor: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.06) })]}>
      <PersonAvatar person={state.user} size={34} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 700, fontSize: 13.5 }}>{state.user.name}</Typography>
        <Typography noWrap sx={{ fontSize: 12, color: 'text.secondary' }}>invited you to be friends</Typography>
      </Box>
      <WsIconButton title="Accept" disabled={busy === 'invite'} onClick={accept} sx={{ color: 'success.main' }}><CheckRoundedIcon /></WsIconButton>
      <WsIconButton title="Not now" onClick={onDone}><CloseRoundedIcon /></WsIconButton>
    </Box>
  );
}

function FriendsPanel({ user, inviteHandle, onClearInvite, onOpenLeaderboard }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { friends, incoming, outgoing, loaded, loading, error, online, unread, last } = useSelector((s) => s.friends);
  const { busy, run } = useFriendAction();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('lg'));
  const { favs, toggle: toggleFav } = useFavourites(user.id);

  const [scope, setScope] = useState('friends'); // 'friends' | 'global'
  const [tab, setTab] = useState('friends'); // 'friends' | 'requests' | 'sent' | 'activity'
  const [filter, setFilter] = useState('all'); // 'all' | 'online' | 'unread' | 'risk' | 'fav'
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
  const globalOn = scope === 'global' || (tab === 'friends' && (noFriends || needle.length >= 2));
  const global = useGlobalPlayers({ enabled: globalOn, q: needle });

  const friendIds = useMemo(() => new Set(friends.map((f) => f.userId)), [friends]);
  const sentIds = useMemo(() => new Set(outgoing.map((o) => o.user.userId)), [outgoing]);
  const received = useMemo(() => new Map(incoming.map((i) => [i.user.userId, i.requestId])), [incoming]);
  const chatFriend = friends.find((f) => f.userId === chatId) || null;

  // preview lines for the chat list
  useEffect(() => { dispatch(fetchChatOverview()); }, [dispatch, friends.length]);

  const isOnline = (f) => Boolean(online[f.userId]);
  const atRisk = (f) => f.streak > 0 && !practisedToday(f);
  const onlineCount = friends.filter(isOnline).length;
  const unreadChats = friends.filter((f) => unread[f.userId] > 0).length;
  const riskCount = friends.filter(atRisk).length;
  const favCount = friends.filter((f) => favs.has(f.userId)).length;

  const nameMatch = (p) => !needle || p.name.toLowerCase().includes(needle) || p.handle.toLowerCase().includes(needle);

  const shownFriends = useMemo(() => {
    const lastAt = (f) => (last[f.userId]?.at ? Date.parse(last[f.userId].at) : 0);
    const keep = {
      all: () => true,
      online: (f) => Boolean(online[f.userId]),
      unread: (f) => unread[f.userId] > 0,
      risk: (f) => f.streak > 0 && !practisedToday(f),
      fav: (f) => favs.has(f.userId),
    }[filter];
    const on = (f) => Number(Boolean(online[f.userId]));
    const cmp = {
      recent: (a, b) => lastAt(b) - lastAt(a) || on(b) - on(a) || b.score - a.score,
      online: (a, b) => on(b) - on(a) || b.score - a.score,
      points: (a, b) => b.score - a.score,
      name: (a, b) => a.name.localeCompare(b.name),
    }[sortBy];
    return friends
      .filter((f) => keep(f) && (!needle || f.name.toLowerCase().includes(needle) || f.handle.toLowerCase().includes(needle)))
      .sort((a, b) => Number(favs.has(b.userId)) - Number(favs.has(a.userId)) || cmp(a, b) || a.handle.localeCompare(b.handle));
  }, [friends, filter, sortBy, needle, online, unread, last, favs]);

  // /dashboard?view=friends&chat=<id> (from a notification toast) opens that chat
  const chatParam = params.get('chat');
  useEffect(() => {
    if (chatParam && friends.some((f) => f.userId === chatParam)) {
      setScope('friends');
      setTab('friends');
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
    setScope('friends');
    setTab('friends');
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

  const goTab = (nextTab, nextFilter = 'all') => {
    setScope('friends');
    setTab(nextTab);
    setFilter(nextFilter);
    setQ('');
  };

  // ---- action cell for a player who is not a friend (or is, in the global list)
  const playerAction = (p) => {
    if (friendIds.has(p.userId)) return <WsIconButton title="Chat" onClick={() => openChat(p.userId)}><ChatRoundedIcon /></WsIconButton>;
    if (sentIds.has(p.userId)) {
      return (
        <Tooltip title="Request sent, waiting for them">
          <Box component="span" sx={(t) => ({ display: 'inline-flex', alignItems: 'center', gap: 0.5, height: 28, px: 1, borderRadius: `${WS.radius}px`, fontSize: 12, fontWeight: 600, color: 'text.secondary', bgcolor: wsSurface(t).raised })}>
            <HourglassTopRoundedIcon sx={{ fontSize: 14 }} />Sent
          </Box>
        </Tooltip>
      );
    }
    if (received.has(p.userId)) {
      return (
        <WsIconButton title="Accept request" disabled={busy === p.userId} onClick={() => run(p.userId, acceptFriendRequest(received.get(p.userId)), 'Friend added')} sx={{ color: 'success.main' }}>
          <CheckRoundedIcon />
        </WsIconButton>
      );
    }
    return (
      <Tooltip title="Send friend request">
        <span>
          <Button
            size="small"
            disableElevation
            disabled={busy === p.userId}
            onClick={() => run(p.userId, sendFriendRequest(p.handle), 'Request sent')}
            startIcon={<PersonAddAlt1RoundedIcon sx={{ fontSize: '16px !important' }} />}
            sx={(t) => ({ height: 28, px: 1.1, borderRadius: `${WS.radius}px`, fontSize: 12.5, fontWeight: 700, textTransform: 'none', color: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.12), '&:hover': { bgcolor: alpha(t.palette.primary.main, 0.22) } })}
          >
            Invite
          </Button>
        </span>
      </Tooltip>
    );
  };

  const players = (global.rows || []).filter((p) => p.userId !== user.id && (scope === 'global' || !friendIds.has(p.userId)));
  const playerRows = (withRank) => players.map((p) => (
    <PersonRow key={p.userId} person={p} rank={withRank ? p.rank : null} sub={`@${p.handle} · ${p.score.toLocaleString()} pts`} action={playerAction(p)} />
  ));
  const playerFooter = (
    <>
      {global.rows === null && global.loading && <SkeletonRows count={5} />}
      {global.error && <Typography sx={{ px: 2, py: 1, fontSize: 12.5, color: 'text.secondary' }}>{global.error}</Typography>}
      {global.hasMore && (
        <Box sx={{ textAlign: 'center', py: 1 }}>
          <Button size="small" onClick={global.loadMore} disabled={global.loading} sx={{ textTransform: 'none', fontWeight: 600 }}>{global.loading ? 'Loading…' : 'Show more players'}</Button>
        </Box>
      )}
    </>
  );

  // ---- what to show under the toolbar
  let body;
  if (scope === 'global') {
    body = (
      <>
        <SectionLabel>{needle ? 'Search results' : 'Top players'}</SectionLabel>
        {playerRows(true)}
        {global.rows && players.length === 0 && !global.loading && !global.error && <EmptyNote icon={<SearchRoundedIcon />}>No player found{needle ? ` for “${needle}”` : ''}.</EmptyNote>}
        {playerFooter}
      </>
    );
  } else if (tab === 'activity') {
    body = <ActivityFeed />;
  } else if (tab === 'requests') {
    const rows = incoming.filter((r) => nameMatch(r.user));
    body = (
      <>
        {rows.length === 0 && <EmptyNote icon={<MarkunreadRoundedIcon />} title="No invitations">When someone invites you, it shows up here.</EmptyNote>}
        {rows.map((r) => (
          <PersonRow
            key={r.requestId}
            person={r.user}
            sub={`@${r.user.handle} · ${timeAgo(r.createdAt)}`}
            action={(
              <Stack direction="row" spacing={0.5}>
                <WsIconButton title="Accept" disabled={busy === r.requestId} onClick={() => run(r.requestId, acceptFriendRequest(r.requestId), 'Friend added')} sx={{ color: 'success.main' }}><CheckRoundedIcon /></WsIconButton>
                <WsIconButton title="Decline" disabled={busy === r.requestId} onClick={() => run(r.requestId, declineFriendRequest(r.requestId), 'Request declined')}><CloseRoundedIcon /></WsIconButton>
              </Stack>
            )}
          />
        ))}
      </>
    );
  } else if (tab === 'sent') {
    const rows = outgoing.filter((r) => nameMatch(r.user));
    body = (
      <>
        {rows.length === 0 && <EmptyNote icon={<HourglassTopRoundedIcon />} title="Nothing pending">Requests you send wait here until they answer.</EmptyNote>}
        {rows.map((r) => (
          <PersonRow
            key={r.requestId}
            person={r.user}
            sub={`@${r.user.handle} · sent ${timeAgo(r.createdAt)}`}
            action={<WsIconButton title="Cancel request" disabled={busy === r.requestId} onClick={() => run(r.requestId, cancelFriendRequest(r.requestId), 'Request cancelled')}><CloseRoundedIcon /></WsIconButton>}
          />
        ))}
      </>
    );
  } else {
    body = (
      <>
        {error && <Alert severity="error" sx={{ mx: 1.5, my: 1 }} action={<Button color="inherit" onClick={() => dispatch(fetchFriends())}>Retry</Button>}>{error}</Alert>}
        {!loaded && loading && <SkeletonRows />}
        {shownFriends.map((f) => (
          <FriendRow
            key={f.userId}
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
        ))}
        {loaded && friends.length > 0 && shownFriends.length === 0 && !needle && <EmptyNote icon={<PeopleAltRoundedIcon />}>No friends in this filter.</EmptyNote>}
        {noFriends && !needle && (
          <>
            <EmptyNote icon={<PeopleAltRoundedIcon />} title="No friends yet">Invite someone below, or share your link with the share icon above.</EmptyNote>
            <SectionLabel>Players you can invite</SectionLabel>
          </>
        )}
        {needle.length >= 2 && friends.length > 0 && <SectionLabel>Players</SectionLabel>}
        {globalOn && playerRows(noFriends && !needle)}
        {globalOn && playerFooter}
        {needle && shownFriends.length === 0 && global.rows && players.length === 0 && !global.loading && <EmptyNote icon={<SearchRoundedIcon />}>{needle.length < 2 ? 'Type at least 2 letters' : `No one found for “${needle}”`}</EmptyNote>}
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

  const showChips = scope === 'friends' && tab === 'friends' && friends.length > 0;
  const showSearch = !(scope === 'friends' && tab === 'activity');

  return (
    <Stack
      ref={rootRef}
      spacing={1.5}
      sx={fillH ? { height: { xs: `calc(${fillH}px - 92px - env(safe-area-inset-bottom))`, md: `calc(${fillH}px - 24px)` } } : { minHeight: 480 }}
    >
      {inviteHandle && <InviteBanner handle={inviteHandle} onDone={onClearInvite} />}

      <Box sx={[surface, { flex: 1, minHeight: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: desktop ? '360px minmax(0, 1fr)' : 'minmax(0, 1fr)', gridTemplateRows: 'minmax(0, 1fr)' }]}>
        {/* ---------------- left: friends / players */}
        <Box sx={(t) => ({ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', borderRight: desktop ? `1px solid ${t.palette.divider}` : 'none' })}>
          {/* header: title, friends / global switch, icons */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ height: WS.bar + 8, px: 1.5, flexShrink: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.2 }}>Friends</Typography>
            <ScopeSwitch value={scope} onChange={(v) => { setScope(v); if (v === 'friends' && tab === 'activity') setTab('friends'); }} />
            <Box sx={{ flex: 1 }} />
            <WsIconButton title="Add friend" onClick={() => { setScope('global'); setTimeout(() => searchRef.current?.focus(), 0); }}><PersonAddAlt1RoundedIcon /></WsIconButton>
            <WsIconButton title="Invite with link" onClick={(e) => setInviteAnchor(e.currentTarget)}><IosShareRoundedIcon /></WsIconButton>
            <WsIconButton title="Friend activity" active={scope === 'friends' && tab === 'activity'} onClick={() => (scope === 'friends' && tab === 'activity' ? goTab('friends') : goTab('activity'))}><TimelineRoundedIcon /></WsIconButton>
            <WsIconButton title="Friends leaderboard" onClick={onOpenLeaderboard}><LeaderboardRoundedIcon /></WsIconButton>
          </Stack>

          {/* counts, each one also opens its list */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 0.75, px: 1.5, pb: 1, flexShrink: 0 }}>
            <StatCard icon={<PeopleAltRoundedIcon />} label="Friends" hint="All friends" value={friends.length} color={theme.palette.primary.main} active={scope === 'friends' && tab === 'friends' && filter !== 'online'} onClick={() => goTab('friends')} />
            <StatCard icon={<WifiTetheringRoundedIcon />} label="Online" hint="Friends online now" value={onlineCount} color={GREEN} active={scope === 'friends' && tab === 'friends' && filter === 'online'} onClick={() => goTab('friends', 'online')} />
            <StatCard icon={<MarkunreadRoundedIcon />} label="Invites" hint="Invitations received" value={incoming.length} color="#EF4444" active={scope === 'friends' && tab === 'requests'} onClick={() => goTab('requests')} />
            <StatCard icon={<HourglassTopRoundedIcon />} label="Pending" hint="Requests you sent, waiting" value={outgoing.length} color="#F59E0B" active={scope === 'friends' && tab === 'sent'} onClick={() => goTab('sent')} />
          </Box>

          {showSearch && (
            <Box sx={{ px: 1.5, pb: 1, flexShrink: 0 }}>
              <TextField
                fullWidth
                size="small"
                inputRef={searchRef}
                placeholder={scope === 'global' ? 'Search all players by name or @handle' : 'Search by name or @handle'}
                value={q}
                onChange={(e) => setQ(e.target.value.slice(0, 40))}
                sx={(t) => ({ '& .MuiOutlinedInput-root': { height: WS.ctrl + 2, borderRadius: `${WS.radius}px`, bgcolor: wsSurface(t).raised, fontSize: 13.5 }, '& fieldset': { border: 'none' } })}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18 }} /></InputAdornment>,
                    endAdornment: q ? (
                      <InputAdornment position="end">
                        <WsIconButton title="Clear search" onClick={() => setQ('')} sx={{ width: 24, height: 24 }}><CloseRoundedIcon sx={{ fontSize: '16px !important' }} /></WsIconButton>
                      </InputAdornment>
                    ) : null,
                  },
                  htmlInput: { 'aria-label': 'Search friends or players', autoCapitalize: 'none', autoCorrect: 'off' },
                }}
              />
            </Box>
          )}

          {showChips && (
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ px: 1.5, pb: 1, flexShrink: 0 }}>
              <Stack direction="row" spacing={0.75} sx={{ flex: 1, minWidth: 0, ...hideScroll }}>
                <FilterChip label="All" count={friends.length} active={filter === 'all'} onClick={() => setFilter('all')} />
                <FilterChip label="Online" count={onlineCount} active={filter === 'online'} onClick={() => setFilter('online')} />
                <FilterChip label="Unread" count={unreadChats} active={filter === 'unread'} onClick={() => setFilter('unread')} />
                <FilterChip label="Streak at risk" count={riskCount} active={filter === 'risk'} onClick={() => setFilter('risk')} />
                <FilterChip label="Favourites" count={favCount} active={filter === 'fav'} onClick={() => setFilter('fav')} />
              </Stack>
              <WsIconButton title="Sort" onClick={(e) => setSortAnchor(e.currentTarget)}><SortRoundedIcon /></WsIconButton>
            </Stack>
          )}

          <Box
            ref={listRef}
            className="autohide-scroll"
            onKeyDown={onListKey}
            sx={(t) => ({ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', borderTop: `1px solid ${t.palette.divider}`, pb: 1 })}
          >
            {body}
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
                  {noFriends ? 'Invite a player from the list and your chat will open here.' : 'Pick a friend on the left to start chatting.'}
                </EmptyNote>
              </Box>
            )}
          </Box>
        )}
      </Box>

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
          <MenuItem key={key} selected={sortBy === key} onClick={() => { setSortBy(key); setSortAnchor(null); }} sx={{ minHeight: 40, fontSize: 14 }}>
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
    </Stack>
  );
}

export default function FriendsView({ isAuthenticated, user, inviteHandle, onClearInvite, onOpenLeaderboard }) {
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <Box sx={[surface, { p: 3, textAlign: 'center' }]}>
        <PeopleAltRoundedIcon sx={{ fontSize: 34, color: 'primary.main' }} />
        <Typography sx={{ fontWeight: 800, mt: 0.5 }}>Compete with friends</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          {inviteHandle ? `@${inviteHandle} invited you. Log in or sign up to accept.` : 'Log in to add friends and see them on the leaderboard.'}
        </Typography>
        <Button variant="contained" disableElevation onClick={() => navigate('/login', { state: { from: { pathname: '/dashboard' } } })} sx={{ height: 40, px: 3 }}>
          Log in
        </Button>
      </Box>
    );
  }
  return <FriendsPanel user={user} inviteHandle={inviteHandle} onClearInvite={onClearInvite} onOpenLeaderboard={onOpenLeaderboard} />;
}
