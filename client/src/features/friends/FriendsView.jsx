import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ListItemIcon, Menu, MenuItem,
  Skeleton, Stack, ThemeProvider, Typography, useMediaQuery, useTheme,
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
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WifiTetheringRoundedIcon from '@mui/icons-material/WifiTetheringRounded';
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { surface } from '../dashboard/dashboardUtils';
import useViewportFill from '../dashboard/useViewportFill';
import { WsIconButton } from '../workspace/wsUi';
import {
  acceptFriendInvite, acceptFriendRequest, cancelFriendRequest, declineFriendRequest, fetchChatOverview, fetchFriends, removeFriend, sendFriendRequest,
} from './friendsSlice';
import { FLAME, mono, practisedToday, timeAgo } from './friendsUi';
import { useFavourites } from './friendsKit';
import { SERIF, frTheme, frTokens } from './friendsTheme';
import {
  AddFriendDialog, Empty, Face, FriendCard, PersonCard, PillBtn, RoundBtn, SearchField, SegmentTile, SkeletonCards, SubTabs, Tag, moduleSx,
} from './friendsRoom';
import useGlobalPlayers from './useGlobalPlayers';
import ActivityFeed from './ActivityFeed';
import FriendChat, { ChatPanel } from './FriendChat';
import { FriendProfilePanel } from './FriendProfileDialog';

const SORTS = [['recent', 'Recent chats'], ['online', 'Online first'], ['points', 'Most points'], ['name', 'Name A to Z']];

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

// ?invite=handle: someone shared their link with me. One slim module: accept or dismiss.
function InviteBanner({ T, handle, onDone }) {
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

  if (state.loading) return <Skeleton variant="rounded" height={72} sx={{ borderRadius: '24px' }} />;
  if (state.error) return <Alert severity="warning" onClose={onDone}>{state.error}</Alert>;
  if (state.isSelf) return <Alert severity="info" onClose={onDone}>This is your own invite link.</Alert>;
  if (state.relation === 'friends') return <Alert severity="success" onClose={onDone}>You and @{state.user.handle} are already friends.</Alert>;

  const accept = async () => {
    if (await run('invite', acceptFriendInvite(handle), `You and @${handle} are now friends`)) onDone();
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={moduleSx(T, { px: 2, py: 1.5, borderRadius: '26px', flexShrink: 0 })}>
      <Face T={T} person={state.user} size={40} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 700, fontSize: 14.5, color: T.ink }}>{state.user.name}</Typography>
        <Typography noWrap sx={{ fontSize: 12.5, color: T.muted }}>wants to join your circle</Typography>
      </Box>
      <RoundBtn T={T} title="Accept" accent disabled={busy === 'invite'} onClick={accept}><CheckRoundedIcon /></RoundBtn>
      <RoundBtn T={T} title="Not now" onClick={onDone}><CloseRoundedIcon /></RoundBtn>
    </Stack>
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
  const T = frTokens(theme.palette.mode);
  const desktop = useMediaQuery(theme.breakpoints.up('lg'));
  const phone = useMediaQuery(theme.breakpoints.down('sm'));
  const btn = phone ? 38 : 42;
  const { favs, toggle: toggleFav } = useFavourites(user.id);

  const [segment, setSegment] = useState('friends'); // 'friends' | 'invites' | 'sent' | 'activity'
  const [sub, setSub] = useState('all'); // inside Friends: 'all' | 'online'
  const [sortBy, setSortBy] = useState('recent');
  const [q, setQ] = useState('');
  const [chatId, setChatId] = useState(null);
  const [panelMode, setPanelMode] = useState('chat'); // 'chat' | 'profile'
  const [acting, setActing] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [inviteAnchor, setInviteAnchor] = useState(null);
  const [sortAnchor, setSortAnchor] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addQ, setAddQ] = useState('');

  const rootRef = useRef(null);
  const listRef = useRef(null);
  // The whole page is exactly one screen tall; only the list and the chat scroll inside their modules.
  const fillH = useViewportFill(rootRef, true, 340);

  const needle = q.trim().toLowerCase().replace(/^@/, '');
  const addNeedle = addQ.trim().toLowerCase().replace(/^@/, '');
  const global = useGlobalPlayers({ enabled: addOpen, q: addNeedle });

  const friendIds = useMemo(() => new Set(friends.map((f) => f.userId)), [friends]);
  const sentIds = useMemo(() => new Set(outgoing.map((o) => o.user.userId)), [outgoing]);
  const received = useMemo(() => new Map(incoming.map((i) => [i.user.userId, i.requestId])), [incoming]);
  const chatFriend = friends.find((f) => f.userId === chatId) || null;
  const noFriends = loaded && friends.length === 0;

  // preview lines for the chat list
  useEffect(() => { dispatch(fetchChatOverview()); }, [dispatch, friends.length]);

  const isOnline = (f) => Boolean(online[f.userId]);
  const onlineCount = friends.filter(isOnline).length;
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
      .filter((f) => (sub === 'all' || online[f.userId]) && (!needle || f.name.toLowerCase().includes(needle) || f.handle.toLowerCase().includes(needle)))
      .sort((a, b) => Number(favs.has(b.userId)) - Number(favs.has(a.userId)) || cmp(a, b) || a.handle.localeCompare(b.handle));
  }, [friends, sub, sortBy, needle, online, last, favs]);

  // /dashboard?view=friends&chat=<id> (from a notification toast) opens that chat
  const chatParam = params.get('chat');
  useEffect(() => {
    if (chatParam && friends.some((f) => f.userId === chatParam)) {
      setSegment('friends');
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

  const goSegment = (next, nextSub = 'all') => {
    setSegment(next);
    setSub(nextSub);
    setQ('');
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

  // ---- action for a player in the "Add a friend" dialog
  const playerAction = (p) => {
    if (friendIds.has(p.userId)) return <Tag T={T} icon={<PeopleAltRoundedIcon />}>Friends</Tag>;
    if (sentIds.has(p.userId)) return <Tag T={T} icon={<HourglassTopRoundedIcon />}>Sent</Tag>;
    if (received.has(p.userId)) {
      return <PillBtn T={T} disabled={busy === p.userId} onClick={() => run(p.userId, acceptFriendRequest(received.get(p.userId)), 'Friend added')} startIcon={<CheckRoundedIcon />}>Accept</PillBtn>;
    }
    return <PillBtn T={T} disabled={busy === p.userId} onClick={() => run(p.userId, sendFriendRequest(p.handle), 'Request sent')} startIcon={<PersonAddAlt1RoundedIcon />}>Add</PillBtn>;
  };
  const players = (global.rows || []).filter((p) => p.userId !== user.id);

  const openAdd = (prefill = '') => { setAddQ(prefill); setAddOpen(true); };

  // ---- what to show in the list module
  let body;
  if (segment === 'activity') {
    body = <ActivityFeed />;
  } else if (segment === 'invites') {
    const rows = incoming.filter((r) => nameMatch(r.user));
    body = (
      <>
        {rows.length === 0 && <Empty T={T} icon={<MarkunreadRoundedIcon />} title="No invitations yet">When someone wants to join your circle, they will show up here.</Empty>}
        {rows.map((r) => (
          <PersonCard
            key={r.requestId} T={T} person={r.user} sub={`@${r.user.handle} · ${timeAgo(r.createdAt)}`}
            action={(
              <Stack direction="row" spacing={1}>
                <RoundBtn T={T} title="Accept" accent size={38} disabled={busy === r.requestId} onClick={() => run(r.requestId, acceptFriendRequest(r.requestId), 'Friend added')}><CheckRoundedIcon /></RoundBtn>
                <RoundBtn T={T} title="Decline" size={38} disabled={busy === r.requestId} onClick={() => run(r.requestId, declineFriendRequest(r.requestId), 'Request declined')}><CloseRoundedIcon /></RoundBtn>
              </Stack>
            )}
          />
        ))}
      </>
    );
  } else if (segment === 'sent') {
    const rows = outgoing.filter((r) => nameMatch(r.user));
    body = (
      <>
        {rows.length === 0 && <Empty T={T} icon={<HourglassTopRoundedIcon />} title="Nothing waiting" action={<PillBtn T={T} onClick={() => openAdd()} startIcon={<PersonAddAlt1RoundedIcon />}>Add a friend</PillBtn>}>Requests you send wait here until they answer.</Empty>}
        {rows.map((r) => (
          <PersonCard
            key={r.requestId} T={T} person={r.user} sub={`@${r.user.handle} · sent ${timeAgo(r.createdAt)}`}
            action={<PillBtn T={T} accent={false} disabled={busy === r.requestId} onClick={() => run(r.requestId, cancelFriendRequest(r.requestId), 'Request cancelled')}>Cancel</PillBtn>}
          />
        ))}
      </>
    );
  } else {
    body = (
      <>
        {error && <Alert severity="error" action={<Button color="inherit" onClick={() => dispatch(fetchFriends())}>Retry</Button>}>{error}</Alert>}
        {!loaded && loading && <SkeletonCards T={T} />}
        {shownFriends.map((f) => (
          <FriendCard
            key={f.userId} T={T} f={f} last={last[f.userId]} myId={user.id} online={isOnline(f)} unread={unread[f.userId]}
            selected={desktop && chatId === f.userId} fav={favs.has(f.userId)} canNudge={!practisedToday(f)}
            nudging={acting === `nudge:${f.userId}`} coding={acting === `room:${f.userId}`}
            onOpen={() => setChatId(f.userId)} onFav={() => toggleFav(f.userId)} onNudge={() => nudge(f)} onCode={() => codeTogether(f, desktop)} onRemove={() => setConfirm(f)}
          />
        ))}
        {noFriends && (
          <Empty T={T} icon={<PeopleAltRoundedIcon />} title="Your circle is waiting" action={<PillBtn T={T} onClick={() => openAdd()} startIcon={<PersonAddAlt1RoundedIcon />}>Add a friend</PillBtn>}>
            Friends make every streak easier. Invite your first one.
          </Empty>
        )}
        {loaded && !noFriends && shownFriends.length === 0 && !needle && sub === 'online' && (
          <Empty T={T} icon={<WifiTetheringRoundedIcon />} title="Quiet right now">None of your friends is online at the moment.</Empty>
        )}
        {loaded && !noFriends && shownFriends.length === 0 && needle && (
          <Empty T={T} icon={<SearchRoundedIcon />} title="No friend found" action={<PillBtn T={T} accent={false} onClick={() => openAdd(q)}>Search everyone</PillBtn>}>
            Nobody in your circle matches “{needle}”.
          </Empty>
        )}
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

  const subtitle = !loaded ? ' ' : noFriends ? 'Your circle is waiting for its first friend' : `${onlineCount} online now · ${friends.length} in your circle`;
  const caption = { invites: 'People who would like to join your circle', sent: 'Waiting for them to say yes', activity: 'What your friends have been up to' }[segment];

  return (
    <Box
      ref={rootRef}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ...(fillH ? { height: { xs: `calc(${fillH}px - 92px - env(safe-area-inset-bottom))`, md: `calc(${fillH}px - 24px)` } } : { minHeight: 480 }) }}
    >
      {inviteHandle && <InviteBanner T={T} handle={inviteHandle} onDone={onClearInvite} />}

      {/* the room: modules standing on one floor */}
      <Box
        sx={{
          flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: desktop ? 'minmax(380px, 440px) minmax(0, 1fr)' : 'minmax(0, 1fr)', gridTemplateRows: 'minmax(0, 1fr)',
          gap: { xs: 2, md: 2.5 }, p: { xs: 1.75, md: 2.75 }, borderRadius: { xs: '28px', md: '36px' }, background: T.room, border: T.border, boxShadow: T.roomShadow,
          overflowX: 'hidden', overflowY: desktop ? 'hidden' : 'auto',
        }}
      >
        {/* ---------------- left: header, three tiles, list */}
        <Box sx={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 } }}>
          <Box sx={moduleSx(T, { flexShrink: 0, p: { xs: 2, sm: 2.5 }, backgroundImage: T.blush })}>
            <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <Typography component="h2" sx={{ fontFamily: SERIF, fontWeight: 700, fontSize: { xs: 26, sm: 30 }, lineHeight: 1.1, letterSpacing: '-0.01em', color: T.ink }}>Friends</Typography>
                  <Box aria-label={`${friends.length} friends`} sx={[{ minWidth: 34, height: 30, px: 1.25, borderRadius: 99, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, color: T.accent, bgcolor: T.base, boxShadow: T.pressed }, mono]}>{loaded ? friends.length : '–'}</Box>
                </Stack>
                <Typography noWrap sx={{ mt: 0.6, fontSize: 13, color: T.muted }}>{subtitle}</Typography>
              </Box>
              <RoundBtn T={T} size={btn} title="Add a friend" accent onClick={() => openAdd()}><PersonAddAlt1RoundedIcon /></RoundBtn>
              <RoundBtn T={T} size={btn} title="Invite with link" onClick={(e) => setInviteAnchor(e.currentTarget)}><IosShareRoundedIcon /></RoundBtn>
              <RoundBtn T={T} size={btn} title="Friend activity" on={segment === 'activity'} onClick={() => (segment === 'activity' ? goSegment('friends') : goSegment('activity'))}><TimelineRoundedIcon /></RoundBtn>
              <RoundBtn T={T} size={btn} title="Friends leaderboard" onClick={onOpenLeaderboard}><LeaderboardRoundedIcon /></RoundBtn>
            </Stack>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: { xs: 1.5, sm: 2 }, flexShrink: 0 }}>
            <SegmentTile T={T} icon={<PeopleAltRoundedIcon />} label="Friends" value={friends.length} active={segment === 'friends'} onClick={() => goSegment('friends')} />
            <SegmentTile T={T} icon={<MarkunreadRoundedIcon />} label="Invites" value={incoming.length} alert active={segment === 'invites'} onClick={() => goSegment('invites')} />
            <SegmentTile T={T} icon={<HourglassTopRoundedIcon />} label="Sent" value={outgoing.length} active={segment === 'sent'} onClick={() => goSegment('sent')} />
          </Box>

          <Box sx={moduleSx(T, { flex: 1, minHeight: { xs: 340, lg: 0 }, display: 'flex', flexDirection: 'column', overflow: 'hidden' })}>
            <Box sx={{ flexShrink: 0, display: 'grid', gap: 2, px: { xs: 2, sm: 2.5 }, pt: { xs: 2, sm: 2.5 }, pb: 1.5 }}>
              {segment === 'friends' ? (
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <SubTabs T={T} value={sub} onChange={setSub} options={[['all', 'All', friends.length], ['online', 'Online', onlineCount]]} />
                  <RoundBtn T={T} size={40} title="Sort" onClick={(e) => setSortAnchor(e.currentTarget)}><SortRoundedIcon /></RoundBtn>
                </Stack>
              ) : (
                <Typography sx={{ fontFamily: SERIF, fontWeight: 700, fontSize: 18, color: T.ink, px: 0.5 }}>{caption}</Typography>
              )}
              {segment !== 'activity' && (
                <SearchField T={T} value={q} onChange={setQ} placeholder={segment === 'friends' ? 'Search your friends' : 'Search by name or @handle'} />
              )}
            </Box>
            <Box
              ref={listRef} className="autohide-scroll" onKeyDown={onListKey}
              sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', display: 'grid', gap: 2, alignContent: 'start', px: { xs: 2, sm: 2.5 }, pt: 1, pb: 2.75 }}
            >
              {body}
            </Box>
          </Box>
        </Box>

        {/* ---------------- right: the chat (desktop) */}
        {desktop && (
          <Box sx={moduleSx(T, { minWidth: 0, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' })}>
            {chatFriend ? (
              <ChatPanel
                key={chatFriend.userId} friend={chatFriend}
                onCodeTogether={() => { setPanelMode('chat'); codeTogether(chatFriend, true); }}
                overlay={chatOverlay(chatFriend)} actions={chatActions(chatFriend)}
              />
            ) : (
              <Box sx={{ m: 'auto' }}>
                <Empty T={T} icon={<ChatRoundedIcon />} title={noFriends ? 'No chats yet' : 'Your messages'}>
                  {noFriends ? 'Add a friend and your conversation will open here.' : 'Pick a friend on the left to start chatting.'}
                </Empty>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* add a friend */}
      <AddFriendDialog
        T={T} open={addOpen} onClose={() => setAddOpen(false)} q={addQ} setQ={setAddQ} onShare={() => { setAddOpen(false); share(); }}
        loading={global.rows === null && global.loading} error={global.error} hasMore={global.hasMore} onMore={global.loadMore}
        empty={Boolean(global.rows) && players.length === 0 && !global.loading && !global.error}
      >
        {players.map((p) => (
          <PersonCard key={p.userId} T={T} person={p} rank={addNeedle ? null : p.rank} sub={`@${p.handle} · ${p.score.toLocaleString()} pts`} action={playerAction(p)} />
        ))}
      </AddFriendDialog>

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
    </Box>
  );
}

export default function FriendsView({ isAuthenticated, user, inviteHandle, onClearInvite, onOpenLeaderboard }) {
  const navigate = useNavigate();
  const outer = useTheme();
  const themed = useMemo(() => frTheme(outer), [outer]);

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
  return (
    <ThemeProvider theme={themed}>
      <FriendsPanel user={user} inviteHandle={inviteHandle} onClearInvite={onClearInvite} onOpenLeaderboard={onOpenLeaderboard} />
    </ThemeProvider>
  );
}
