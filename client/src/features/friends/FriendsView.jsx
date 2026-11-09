import BackToDashboard from '../../components/BackToDashboard';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS } from '../../app/design/designTokens';
import MarkunreadRoundedIcon from '@mui/icons-material/MarkunreadRounded';
import MobileFriends, { MobileShell } from './MobileFriends';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ScheduleSendRoundedIcon from '@mui/icons-material/ScheduleSendRounded';
import { acceptFriendRequest, cancelFriendRequest, declineFriendRequest, fetchChatOverview, fetchFriends, sendFriendRequest } from './friendsSlice';
import { extractErrorMessage } from '../../api/apiClient';
import { friendsApi } from '../../api/friendsApi';
import { surface } from '../dashboard/dashboardUtils';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFavourites } from './friendsKit';
import useGlobalPlayers from './useGlobalPlayers';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import useViewportFill from '../dashboard/useViewportFill';
import { renderFriendsList } from './desktop/friendsListBody';
import { buildChatHandlers } from './desktop/friendsChatHandlers';
import { renderOverlays } from './desktop/friendsOverlays';
import { renderDesktopLayout } from './desktop/DesktopFriendsLayout';
import { useFriendAction } from './desktop/useFriendAction';

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

  const players = (global.rows || []).filter((p) => p.userId !== user.id && (view === 'find' || !friendIds.has(p.userId)));

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
    { key: 'requests', label: 'Requests', title: 'Friend requests', icon: <MarkunreadRoundedIcon />, count: incoming.length, badge: COLOR_PALETTE.red[500] },
    { key: 'sent', label: 'Sent', title: 'Sent requests', icon: <ScheduleSendRoundedIcon />, count: outgoing.length, badge: COLOR_PALETTE.amber[500] },
  ];

  const ctx = { dispatch, enqueueSnackbar, navigate, reduce, params, setParams, friends, incoming, outgoing, loaded, loading, error, online, unread, last, busy, run, theme, desktop, phone, favs, toggleFav, view, setView, filter, setFilter, sortBy, setSortBy, q, setQ, chatId, setChatId, panelMode, setPanelMode, acting, setActing, confirm, setConfirm, inviteAnchor, setInviteAnchor, sortAnchor, setSortAnchor, rootRef, listRef, searchRef, fillH, needle, noFriends, globalOn, global, friendIds, sentIds, received, chatFriend, isOnline, onlineFriends, onlineCount, nameMatch, shownFriends, codeTogether, nudge, openChat, onListKey, link, message, closeInvite, copy, share, goView, toggleView, players, showChips, showSearch, iconSize, title, subtitle, tabs, user, inviteHandle, onClearInvite, onOpenLeaderboard };
  Object.assign(ctx, buildChatHandlers(ctx));
  ctx.body = renderFriendsList(ctx);
  ctx.overlays = renderOverlays(ctx);
  const { overlays } = ctx;

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

  return renderDesktopLayout(ctx);
}

export default function FriendsView({ isAuthenticated, user, inviteHandle, onClearInvite, onOpenLeaderboard }) {
  const navigate = useNavigate();
  const phone = useMediaQuery(useTheme().breakpoints.down('md'), { noSsr: true });

  if (!isAuthenticated) {
    const card = (
      <Box sx={[surface, { p: 4, textAlign: 'center' }]}>
        <PeopleAltRoundedIcon sx={{ fontSize: FONT_SIZES.heroLg, color: 'primary.main' }} />
        <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, mt: 1 }}>Compete with friends</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2.5 }}>
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
