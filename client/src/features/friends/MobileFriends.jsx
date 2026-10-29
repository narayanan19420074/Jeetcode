import { useEffect, useState } from 'react';
import { Alert, Box, Button, ButtonBase, IconButton, InputAdornment, Skeleton, Stack, TextField, Typography } from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ScheduleSendRoundedIcon from '@mui/icons-material/ScheduleSendRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import BackToDashboard from '../../components/BackToDashboard';
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { tint } from '../dashboard/dashboardUtils';
import { acceptFriendInvite } from './friendsSlice';
import { PersonAvatar, statusInfo, timeAgo } from './friendsUi';
import { previewOf, shortTime } from './friendsKit';
import ActivityFeed from './ActivityFeed';

// Phone layout of the Friends page. It follows the phone Store, Problems, Leaderboard and Study Plan
// pages: same page padding, 44px icon buttons, centred header, 1.25rem section titles, tinted pills
// and divider-separated rows. The page itself scrolls and there is no top navigation bar on phones.
// The chat still opens in its own full-height drawer (FriendChat).

const ACCENT = '#6366F1';
const SUCCESS = 'var(--jc-easy)';
const REQUEST_TABS = ['friends', 'requests', 'sent'];

const scrollRow = {
  display: 'flex',
  gap: 0.75,
  overflowX: 'auto',
  mx: -1.75,
  px: 1.75,
  pb: 0.5,
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

const pillBtn = { height: 44, px: 2.5, borderRadius: 999, fontWeight: 800, fontSize: '0.95rem', textTransform: 'none', whiteSpace: 'nowrap', flexShrink: 0 };
const solidBtn = { ...pillBtn, bgcolor: ACCENT, color: '#fff', '&:hover': { bgcolor: `color-mix(in srgb, ${ACCENT} 85%, #000)` } };
const smallBtn = (c) => ({ height: 40, px: 1.75, borderRadius: 999, fontWeight: 800, fontSize: '0.85rem', textTransform: 'none', whiteSpace: 'nowrap', flexShrink: 0, bgcolor: tint(c, 20), color: c, '&:hover': { bgcolor: tint(c, 30) } });
const tintIcon = (c, on = false) => (t) => ({
  width: 44,
  height: 44,
  flexShrink: 0,
  bgcolor: on ? c : tint(c, t.palette.mode === 'dark' ? 16 : 9),
  color: on ? '#fff' : c,
  '&:hover': { bgcolor: on ? c : tint(c, 22) },
});

// Page padding shared by the phone Friends screens.
export function MobileShell({ children }) {
  return <Box sx={{ px: 1.75, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>{children}</Box>;
}

function SectionTitle({ children, first = false }) {
  return (
    <Typography component="h2" sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, letterSpacing: '-0.01em', mb: 1.5, mt: first ? 0 : 3 }}>
      {children}
    </Typography>
  );
}

function Empty({ title, children, action }) {
  return (
    <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
      <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: action ? 2 : 0 }}>
        {children}
      </Typography>
      {action}
    </Box>
  );
}

function SkeletonRows({ count = 6 }) {
  return Array.from({ length: count }, (_, i) => (
    <Stack key={i} direction="row" sx={{ alignItems: 'center', gap: 1.5, py: 1.5, px: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Skeleton variant="circular" width={48} height={48} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width={`${40 + ((i * 17) % 35)}%`} />
        <Skeleton variant="text" width="65%" />
      </Box>
    </Stack>
  ));
}

function Pills({ label, options, value, onChange, role = 'tab' }) {
  return (
    <Box sx={scrollRow} role={role === 'tab' ? 'tablist' : 'group'} aria-label={label}>
      {options.map(([v, text, dot]) => {
        const on = v === value;
        return (
          <ButtonBase
            key={v}
            role={role === 'tab' ? 'tab' : undefined}
            aria-selected={role === 'tab' ? on : undefined}
            aria-pressed={role === 'tab' ? undefined : on}
            onClick={() => onChange(v)}
            sx={(t) => ({
              flexShrink: 0,
              height: 40,
              px: 2,
              gap: 0.75,
              borderRadius: 999,
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              fontWeight: on ? 800 : 700,
              whiteSpace: 'nowrap',
              color: on ? ACCENT : t.palette.text.secondary,
              bgcolor: on ? tint(ACCENT, 20) : 'transparent',
            })}
          >
            {dot && <Box aria-hidden sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22C55E' }} />}
            {text}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

// ---------- rows ----------

function FriendRow({ f, last, myId, online, unread, fav, onOpen }) {
  const st = statusInfo(f, online);
  const mine = last && last.from === myId;
  const preview = last ? previewOf(last, myId) : st.text;
  return (
    <Box data-fid={f.userId} sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-of-type': { borderBottom: 'none' } }}>
      <ButtonBase
        onClick={onOpen}
        aria-label={`Chat with ${f.name}${unread ? `, ${unread} unread` : ''}`}
        sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5, py: 1.25, px: 0.5, textAlign: 'left', fontFamily: 'inherit', color: 'inherit' }}
      >
        <PersonAvatar person={f} size={48} online={online} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
            <Typography noWrap sx={{ fontWeight: unread ? 800 : 700, fontSize: '1rem', lineHeight: 1.35, flex: 1, minWidth: 0 }}>
              {f.name}
            </Typography>
            {fav && <StarRoundedIcon aria-label="Favourite" sx={{ fontSize: 16, color: 'warning.main', flexShrink: 0 }} />}
            {last && (
              <Typography sx={{ flexShrink: 0, fontSize: '0.75rem', fontWeight: unread ? 800 : 500, color: unread ? ACCENT : 'text.secondary' }}>{shortTime(last.at)}</Typography>
            )}
          </Stack>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, mt: 0.2 }}>
            {mine && last.kind === 'text' && (last.read ? <DoneAllRoundedIcon sx={{ fontSize: 16, color: ACCENT, flexShrink: 0 }} /> : <DoneRoundedIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />)}
            <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: '0.85rem', fontWeight: unread ? 600 : 400, color: !last && st.live ? SUCCESS : unread ? 'text.primary' : 'text.secondary' }}>
              {preview}
            </Typography>
            {unread > 0 && (
              <Typography component="span" aria-hidden sx={{ flexShrink: 0, minWidth: 22, height: 22, px: 0.75, borderRadius: 11, display: 'grid', placeItems: 'center', bgcolor: ACCENT, color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>
                {unread > 99 ? '99+' : unread}
              </Typography>
            )}
          </Stack>
        </Box>
      </ButtonBase>
    </Box>
  );
}

function PersonRow({ person, rank, sub, action }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, py: 1.25, px: 0.5, minHeight: 68, borderBottom: '1px solid', borderColor: 'divider', '&:last-of-type': { borderBottom: 'none' } }}>
      {rank != null && (
        <Typography sx={{ width: 28, flexShrink: 0, textAlign: 'center', fontSize: '0.9rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: rank <= 3 ? '#F59E0B' : 'text.secondary' }}>{rank}</Typography>
      )}
      <PersonAvatar person={person} size={44} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.35 }}>
          {person.name}
        </Typography>
        <Typography noWrap color="text.secondary" sx={{ fontSize: '0.82rem' }}>
          {sub || `@${person.handle}`}
        </Typography>
      </Box>
      {action}
    </Stack>
  );
}

// ---------- invite link banner (?invite=handle) ----------

function InviteBanner({ handle, onDone, run, busy }) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true });
    friendsApi
      .previewInvite(handle)
      .then(({ data }) => !cancelled && setState({ loading: false, ...data.data }))
      .catch((err) => !cancelled && setState({ loading: false, error: extractErrorMessage(err) }));
    return () => {
      cancelled = true;
    };
  }, [handle]);

  if (state.loading) return <Skeleton variant="rounded" height={120} sx={{ mt: 1.5, borderRadius: '26px' }} />;
  if (state.error) return <Alert severity="warning" onClose={onDone} sx={{ mt: 1.5 }}>{state.error}</Alert>;
  if (state.isSelf) return <Alert severity="info" onClose={onDone} sx={{ mt: 1.5 }}>This is your own invite link.</Alert>;
  if (state.relation === 'friends') return <Alert severity="success" onClose={onDone} sx={{ mt: 1.5 }}>You and @{state.user.handle} are already friends.</Alert>;

  const accept = async () => {
    if (await run('invite', acceptFriendInvite(handle), `You and @${handle} are now friends`)) onDone();
  };

  return (
    <Box
      sx={(t) => ({
        mt: 1.5,
        p: 1.75,
        borderRadius: '26px',
        background: `linear-gradient(160deg, ${tint(ACCENT, t.palette.mode === 'dark' ? 20 : 15)} 0%, ${tint(ACCENT, 4)} 62%, transparent 100%)`,
        border: `1px solid ${tint(ACCENT, 24)}`,
      })}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
        <PersonAvatar person={state.user} size={48} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.3 }}>
            {state.user.name}
          </Typography>
          <Typography noWrap color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            Invited you to be friends
          </Typography>
        </Box>
      </Stack>
      <Button onClick={accept} disabled={busy === 'invite'} fullWidth disableElevation variant="contained" sx={{ ...solidBtn, mt: 1.5, height: 48 }}>
        Accept invite
      </Button>
      <Button onClick={onDone} fullWidth sx={{ ...pillBtn, mt: 0.5, color: ACCENT }}>
        Not now
      </Button>
    </Box>
  );
}

// ---------- the page ----------

export default function MobileFriends({
  inviteHandle,
  onClearInvite,
  run,
  busy,
  onOpenLeaderboard,
  view,
  goView,
  filter,
  setFilter,
  q,
  setQ,
  title,
  subtitle,
  friends,
  incoming,
  outgoing,
  loaded,
  loading,
  error,
  onRetry,
  online,
  unread,
  last,
  favs,
  myId,
  shownFriends,
  onlineFriends,
  onlineCount,
  needle,
  noFriends,
  globalOn,
  global,
  players,
  friendIds,
  sentIds,
  received,
  nameMatch,
  onOpenChat,
  onFind,
  onAdd,
  onAccept,
  onDecline,
  onCancel,
  onInvite,
  onSort,
  onActivity,
}) {
  const showSearch = view !== 'activity';
  const showChips = view === 'friends' && friends.length > 0;
  const HeaderIcon = view === 'find' ? PersonAddAlt1RoundedIcon : view === 'activity' ? TimelineRoundedIcon : PeopleAltRoundedIcon;

  const tabs = [
    ['friends', `Friends · ${friends.length}`],
    ['requests', incoming.length ? `Requests · ${incoming.length}` : 'Requests'],
    ['sent', outgoing.length ? `Sent · ${outgoing.length}` : 'Sent'],
  ];

  const playerAction = (p) => {
    if (friendIds.has(p.userId)) {
      return (
        <IconButton onClick={() => onOpenChat(p.userId)} aria-label={`Chat with ${p.name}`} sx={tintIcon(ACCENT)}>
          <ChatRoundedIcon />
        </IconButton>
      );
    }
    if (sentIds.has(p.userId)) {
      return (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, flexShrink: 0, color: 'text.secondary' }}>
          <ScheduleSendRoundedIcon sx={{ fontSize: 18 }} />
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Request sent</Typography>
        </Stack>
      );
    }
    if (received.has(p.userId)) {
      return (
        <Button disableElevation disabled={busy === p.userId} onClick={() => onAccept(received.get(p.userId), p.userId)} sx={smallBtn(SUCCESS)}>
          Accept
        </Button>
      );
    }
    return (
      <Button disableElevation disabled={busy === p.userId} onClick={() => onAdd(p)} sx={smallBtn(ACCENT)}>
        Add friend
      </Button>
    );
  };

  const playerRows = (withRank) =>
    players.map((p) => <PersonRow key={p.userId} person={p} rank={withRank ? p.rank : null} sub={`@${p.handle} · ${p.score.toLocaleString('en-IN')} pts`} action={playerAction(p)} />);

  const playerFooter = (
    <>
      {global.rows === null && global.loading && <SkeletonRows count={5} />}
      {global.error && (
        <Typography color="text.secondary" sx={{ py: 1.5, fontSize: '0.9rem' }}>
          {global.error}
        </Typography>
      )}
      {global.hasMore && (
        <Box sx={{ textAlign: 'center', pt: 1.5 }}>
          <Button variant="outlined" onClick={global.loadMore} disabled={global.loading} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}>
            {global.loading ? 'Loading…' : 'Show more players'}
          </Button>
        </Box>
      )}
    </>
  );

  let body;
  if (view === 'find') {
    body = (
      <>
        <SectionTitle first>{needle ? 'Search results' : 'Top players'}</SectionTitle>
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>{playerRows(true)}</Box>
        {global.rows && players.length === 0 && !global.loading && !global.error && (
          <Empty title="No player found">{needle ? `Nobody matches “${needle}”. Check the spelling or try their @handle.` : 'No players to show yet.'}</Empty>
        )}
        {playerFooter}
      </>
    );
  } else if (view === 'activity') {
    body = (
      <Box sx={{ mx: -1, mt: 1 }}>
        <ActivityFeed />
      </Box>
    );
  } else if (view === 'requests') {
    const rows = incoming.filter((r) => nameMatch(r.user));
    body = (
      <>
        <SectionTitle first>Friend requests</SectionTitle>
        {rows.length === 0 ? (
          <Empty title="No friend requests">When someone sends you a request, it shows up here.</Empty>
        ) : (
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            {rows.map((r) => (
              <PersonRow
                key={r.requestId}
                person={r.user}
                sub={`@${r.user.handle} · ${timeAgo(r.createdAt)}`}
                action={
                  <Stack direction="row" sx={{ gap: 0.75 }}>
                    <IconButton disabled={busy === r.requestId} onClick={() => onAccept(r.requestId, r.requestId)} aria-label={`Accept request from ${r.user.name}`} sx={tintIcon(SUCCESS)}>
                      <CheckRoundedIcon />
                    </IconButton>
                    <IconButton disabled={busy === r.requestId} onClick={() => onDecline(r.requestId)} aria-label={`Decline request from ${r.user.name}`} sx={tintIcon('#64748B')}>
                      <CloseRoundedIcon />
                    </IconButton>
                  </Stack>
                }
              />
            ))}
          </Box>
        )}
      </>
    );
  } else if (view === 'sent') {
    const rows = outgoing.filter((r) => nameMatch(r.user));
    body = (
      <>
        <SectionTitle first>Sent requests</SectionTitle>
        {rows.length === 0 ? (
          <Empty title="No sent requests">Requests you send wait here until the other person accepts.</Empty>
        ) : (
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            {rows.map((r) => (
              <PersonRow
                key={r.requestId}
                person={r.user}
                sub={`@${r.user.handle} · sent ${timeAgo(r.createdAt)}`}
                action={
                  <IconButton disabled={busy === r.requestId} onClick={() => onCancel(r.requestId)} aria-label={`Cancel request to ${r.user.name}`} sx={tintIcon('#64748B')}>
                    <CloseRoundedIcon />
                  </IconButton>
                }
              />
            ))}
          </Box>
        )}
      </>
    );
  } else {
    const showRail = filter === 'all' && !needle && onlineCount > 0;
    body = (
      <>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 1.5 }}
            action={
              <Button color="inherit" size="small" onClick={onRetry}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        {!loaded && loading && <SkeletonRows />}
        {showRail && (
          <>
            <SectionTitle first>Online now</SectionTitle>
            <Box sx={scrollRow}>
              {onlineFriends.map((p) => (
                <ButtonBase key={p.userId} onClick={() => onOpenChat(p.userId)} aria-label={`Chat with ${p.name}, online`} sx={{ flexDirection: 'column', gap: 0.6, width: 64, flexShrink: 0, fontFamily: 'inherit' }}>
                  <PersonAvatar person={p} size={52} online />
                  <Typography noWrap color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 600, width: '100%', textAlign: 'center' }}>
                    {p.name.split(' ')[0]}
                  </Typography>
                </ButtonBase>
              ))}
            </Box>
            <SectionTitle>All friends</SectionTitle>
          </>
        )}
        {shownFriends.length > 0 && (
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            {shownFriends.map((f) => (
              <FriendRow key={f.userId} f={f} last={last[f.userId]} myId={myId} online={Boolean(online[f.userId])} unread={unread[f.userId]} fav={favs.has(f.userId)} onOpen={() => onOpenChat(f.userId)} />
            ))}
          </Box>
        )}
        {loaded && friends.length > 0 && shownFriends.length === 0 && !needle && <Empty title="Nobody is online">Friends show up here as soon as they are active on JeetCode.</Empty>}
        {noFriends && !needle && (
          <>
            <Empty title="No friends yet">Add someone from the list below, or share your invite link with the share icon above.</Empty>
            <SectionTitle>Players you can add</SectionTitle>
          </>
        )}
        {needle.length >= 2 && friends.length > 0 && <SectionTitle>Other players</SectionTitle>}
        {globalOn && <Box sx={{ borderTop: players.length > 0 ? '1px solid' : 'none', borderColor: 'divider' }}>{playerRows(noFriends && !needle)}</Box>}
        {globalOn && playerFooter}
        {needle && shownFriends.length === 0 && global.rows && players.length === 0 && !global.loading && (
          <Empty title="No one found">{needle.length < 2 ? 'Type at least 2 letters.' : `Nobody matches “${needle}”.`}</Empty>
        )}
      </>
    );
  }

  return (
    <>
      {/* Back + quick actions */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <BackToDashboard sx={{ width: 44, height: 44, border: 'none', bgcolor: 'transparent' }} />
        <Stack direction="row" sx={{ gap: 0.5 }}>
          <IconButton onClick={onFind} aria-label="Find players" aria-pressed={view === 'find'} sx={tintIcon(ACCENT, view === 'find')}>
            <PersonAddAlt1RoundedIcon />
          </IconButton>
          <IconButton onClick={(e) => onInvite(e.currentTarget)} aria-label="Invite with link" aria-haspopup="menu" sx={tintIcon(ACCENT)}>
            <IosShareRoundedIcon />
          </IconButton>
          <IconButton onClick={onActivity} aria-label="Friend activity" aria-pressed={view === 'activity'} sx={tintIcon(ACCENT, view === 'activity')}>
            <TimelineRoundedIcon />
          </IconButton>
          <IconButton onClick={onOpenLeaderboard} aria-label="Friends leaderboard" sx={tintIcon(ACCENT)}>
            <LeaderboardRoundedIcon />
          </IconButton>
        </Stack>
      </Stack>

      {inviteHandle && <InviteBanner handle={inviteHandle} onDone={onClearInvite} run={run} busy={busy} />}

      {/* Search */}
      {showSearch && (
        <TextField
          fullWidth
          size="small"
          placeholder={view === 'find' ? 'Search all players' : 'Search by name or @handle'}
          value={q}
          onChange={(e) => setQ(e.target.value.slice(0, 40))}
          slotProps={{
            htmlInput: { 'aria-label': 'Search friends or players', autoCapitalize: 'none', autoCorrect: 'off' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: q ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setQ('')} aria-label="Clear search">
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
          sx={(t) => ({
            mt: 1,
            '& .MuiOutlinedInput-root': { borderRadius: 999, height: 48, bgcolor: tint(ACCENT, t.palette.mode === 'dark' ? 16 : 9) },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
          })}
        />
      )}

      {/* Header */}
      <Box sx={{ textAlign: 'center', mt: 2.5 }}>
        <Box
          sx={{
            width: 84,
            height: 84,
            mx: 'auto',
            borderRadius: '26px',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            background: `linear-gradient(135deg, ${ACCENT}, color-mix(in srgb, ${ACCENT} 60%, #000))`,
            boxShadow: `0 14px 26px -12px ${ACCENT}`,
          }}
        >
          <HeaderIcon sx={{ fontSize: 44 }} />
        </Box>
        <Typography component="h1" noWrap sx={{ mt: 1.75, fontWeight: 800, fontSize: '1.9rem', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1rem', mt: 0.25 }}>
          {subtitle}
        </Typography>
      </Box>

      {/* Tabs + filters */}
      <Box sx={{ mt: 2.5 }}>
        <Pills label="Friends, requests and sent requests" options={tabs} value={REQUEST_TABS.includes(view) ? view : ''} onChange={(key) => goView(key)} />
      </Box>
      {showChips && (
        <Stack direction="row" sx={{ alignItems: 'center', mt: 0.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Pills
              role="group"
              label="Filter friends"
              options={[
                ['all', `All · ${friends.length}`],
                ['online', `Online · ${onlineCount}`, true],
              ]}
              value={filter}
              onChange={setFilter}
            />
          </Box>
          <IconButton onClick={(e) => onSort(e.currentTarget)} aria-label="Sort friends" aria-haspopup="menu" sx={tintIcon(ACCENT)}>
            <SortRoundedIcon />
          </IconButton>
        </Stack>
      )}

      {/* List */}
      <Box sx={{ mt: 2 }}>{body}</Box>
    </>
  );
}
