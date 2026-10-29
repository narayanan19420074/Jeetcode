import { useEffect, useState } from 'react';
import { Alert, Box, Button, ButtonBase, IconButton, InputAdornment, Skeleton, Stack, TextField, Typography } from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ScheduleSendRoundedIcon from '@mui/icons-material/ScheduleSendRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import { Link as RouterLink } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { tint } from '../dashboard/dashboardUtils';
import {
  LIB_ACCENT,
  LIB_TRACKING,
  LibraryFont,
  PageHeader,
  libBackBtnSx,
  libChipSx,
  libIconBtnSx,
  libSearchSx,
  libSectionTitleSx,
  libSmallBtnSx,
  libSolidBtnSx,
  libTintBtnSx,
} from '../dashboard/components/libraryStyle';
import { acceptFriendInvite } from './friendsSlice';
import { PersonAvatar, statusInfo, timeAgo } from './friendsUi';
import { previewOf, shortTime } from './friendsKit';
import ActivityFeed from './ActivityFeed';

// Phone layout of the Friends page in the Library look (same as the phone Problems, Home and You pages):
// Roboto type, warm surface, 16px page padding, 40px icon buttons, centred header tile, 18px section titles,
// cream pills and divider-separated rows. The page itself scrolls and there is no top navigation bar on phones.
// The chat still opens in its own full-height drawer (FriendChat).

const ACCENT = LIB_ACCENT;
const SUCCESS = 'var(--jc-easy)';
const REQUEST_TABS = ['friends', 'requests', 'sent'];

const scrollRow = {
  display: 'flex',
  gap: 1,
  overflowX: 'auto',
  mx: -2,
  px: 2,
  pb: 0.5,
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

const solidBtn = libSolidBtnSx;
const smallBtn = (c) => ({ ...libSmallBtnSx, bgcolor: tint(c, 20), color: c, '&:hover': { bgcolor: tint(c, 30) } });
// Accent buttons are neutral cream pills (solid accent when switched on); other colours stay tinted.
const tintIcon = (c, on = false) => (t) =>
  c === ACCENT
    ? on
      ? { ...libIconBtnSx, bgcolor: ACCENT, color: '#fff', '&:hover': { bgcolor: ACCENT } }
      : libIconBtnSx
    : { width: 40, height: 40, flexShrink: 0, bgcolor: tint(c, t.palette.mode === 'dark' ? 16 : 12), color: c, '&:hover': { bgcolor: tint(c, 22) } };

// Page padding shared by the phone Friends screens.
export function MobileShell({ children }) {
  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>{children}</Box>
    </LibraryFont>
  );
}

function SectionTitle({ children, first = false }) {
  return (
    <Typography component="h2" sx={{ ...libSectionTitleSx, mb: 1.5, mt: first ? 0 : 4 }}>
      {children}
    </Typography>
  );
}

function Empty({ title, children, action }) {
  return (
    <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
      <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
      <Typography variant="body2" color="var(--lib-muted)" sx={{ mt: 0.5, mb: action ? 2 : 0 }}>
        {children}
      </Typography>
      {action}
    </Box>
  );
}

function SkeletonRows({ count = 6 }) {
  return Array.from({ length: count }, (_, i) => (
    <Stack key={i} direction="row" sx={{ alignItems: 'center', gap: 1.5, py: 1.5, px: 0.5, borderBottom: '1px solid', borderColor: 'var(--lib-divider)' }}>
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
            sx={libChipSx(on)}
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
    <Box data-fid={f.userId} sx={{ borderBottom: '1px solid', borderColor: 'var(--lib-divider)', '&:last-of-type': { borderBottom: 'none' } }}>
      <ButtonBase
        onClick={onOpen}
        aria-label={`Chat with ${f.name}${unread ? `, ${unread} unread` : ''}`}
        sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px', py: 1.25, px: 0.5, textAlign: 'left', fontFamily: 'inherit', color: 'inherit' }}
      >
        <PersonAvatar person={f} size={48} online={online} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
            <Typography noWrap sx={{ fontWeight: unread ? 700 : 500, fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING, flex: 1, minWidth: 0 }}>
              {f.name}
            </Typography>
            {fav && <StarRoundedIcon aria-label="Favourite" sx={{ fontSize: 16, color: 'warning.main', flexShrink: 0 }} />}
            {last && (
              <Typography sx={{ flexShrink: 0, fontSize: 12, fontWeight: unread ? 700 : 400, color: unread ? ACCENT : 'var(--lib-muted)' }}>{shortTime(last.at)}</Typography>
            )}
          </Stack>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, mt: 0.2 }}>
            {mine && last.kind === 'text' && (last.read ? <DoneAllRoundedIcon sx={{ fontSize: 16, color: ACCENT, flexShrink: 0 }} /> : <DoneRoundedIcon sx={{ fontSize: 16, color: 'var(--lib-muted)', flexShrink: 0 }} />)}
            <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: 14, letterSpacing: LIB_TRACKING, fontWeight: unread ? 500 : 400, color: !last && st.live ? SUCCESS : unread ? 'var(--lib-text)' : 'var(--lib-muted)' }}>
              {preview}
            </Typography>
            {unread > 0 && (
              <Typography component="span" aria-hidden sx={{ flexShrink: 0, minWidth: 22, height: 22, px: 0.75, borderRadius: 11, display: 'grid', placeItems: 'center', bgcolor: ACCENT, color: '#fff', fontSize: 12, fontWeight: 700 }}>
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
    <Stack direction="row" sx={{ alignItems: 'center', gap: '12px', py: 1.25, px: 0.5, minHeight: 68, borderBottom: '1px solid', borderColor: 'var(--lib-divider)', '&:last-of-type': { borderBottom: 'none' } }}>
      {rank != null && (
        <Typography sx={{ width: 28, flexShrink: 0, textAlign: 'center', fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: rank <= 3 ? '#F59E0B' : 'var(--lib-muted)' }}>{rank}</Typography>
      )}
      <PersonAvatar person={person} size={44} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>
          {person.name}
        </Typography>
        <Typography noWrap color="var(--lib-muted)" sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING }}>
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

  if (state.loading) return <Skeleton variant="rounded" height={120} sx={{ mt: 1.5, borderRadius: '20px' }} />;
  if (state.error) return <Alert severity="warning" onClose={onDone} sx={{ mt: 1.5 }}>{state.error}</Alert>;
  if (state.isSelf) return <Alert severity="info" onClose={onDone} sx={{ mt: 1.5 }}>This is your own invite link.</Alert>;
  if (state.relation === 'friends') return <Alert severity="success" onClose={onDone} sx={{ mt: 1.5 }}>You and @{state.user.handle} are already friends.</Alert>;

  const accept = async () => {
    if (await run('invite', acceptFriendInvite(handle), `You and @${handle} are now friends`)) onDone();
  };

  return (
    <Box
      sx={{ mt: 1.5, p: 2, borderRadius: '20px', bgcolor: 'var(--lib-chip)', border: '1px solid var(--lib-border)' }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
        <PersonAvatar person={state.user} size={48} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>
            {state.user.name}
          </Typography>
          <Typography noWrap color="var(--lib-muted)" sx={{ fontSize: 14, letterSpacing: LIB_TRACKING }}>
            Invited you to be friends
          </Typography>
        </Box>
      </Stack>
      <Button onClick={accept} disabled={busy === 'invite'} fullWidth disableElevation variant="contained" sx={{ ...solidBtn, mt: 1.5 }}>
        Accept invite
      </Button>
      <Button onClick={onDone} fullWidth sx={{ ...libTintBtnSx, mt: 0.5, bgcolor: 'transparent', color: ACCENT, '&:hover': { bgcolor: 'transparent' } }}>
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
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, flexShrink: 0, color: 'var(--lib-muted)' }}>
          <ScheduleSendRoundedIcon sx={{ fontSize: 18 }} />
          <Typography sx={{ fontSize: 14, whiteSpace: 'nowrap' }}>Request sent</Typography>
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
        <Typography color="var(--lib-muted)" sx={{ py: 1.5, fontSize: 15 }}>
          {global.error}
        </Typography>
      )}
      {global.hasMore && (
        <Box sx={{ textAlign: 'center', pt: 1.5 }}>
          <Button variant="outlined" onClick={global.loadMore} disabled={global.loading} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 500, fontSize: 16, color: 'var(--lib-text)', borderColor: 'var(--lib-divider)' }}>
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
        <Box sx={{ borderTop: '1px solid', borderColor: 'var(--lib-divider)' }}>{playerRows(true)}</Box>
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
          <Box sx={{ borderTop: '1px solid', borderColor: 'var(--lib-divider)' }}>
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
          <Box sx={{ borderTop: '1px solid', borderColor: 'var(--lib-divider)' }}>
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
                  <Typography noWrap color="var(--lib-muted)" sx={{ fontSize: 13, letterSpacing: LIB_TRACKING, width: '100%', textAlign: 'center' }}>
                    {p.name.split(' ')[0]}
                  </Typography>
                </ButtonBase>
              ))}
            </Box>
            <SectionTitle>All friends</SectionTitle>
          </>
        )}
        {shownFriends.length > 0 && (
          <Box sx={{ borderTop: '1px solid', borderColor: 'var(--lib-divider)' }}>
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
        {globalOn && <Box sx={{ borderTop: players.length > 0 ? '1px solid' : 'none', borderColor: 'var(--lib-divider)' }}>{playerRows(noFriends && !needle)}</Box>}
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
        <IconButton component={RouterLink} to="/dashboard" aria-label="Back to dashboard" sx={libBackBtnSx}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Stack direction="row" sx={{ gap: 1 }}>
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
              endAdornment: q ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setQ('')} aria-label="Clear search">
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
          sx={libSearchSx}
        />
      )}

      {/* Header */}
      <PageHeader icon={HeaderIcon} title={title} subtitle={subtitle} />

      {/* Tabs + filters */}
      <Box sx={{ mt: 3 }}>
        <Pills label="Friends, requests and sent requests" options={tabs} value={REQUEST_TABS.includes(view) ? view : ''} onChange={(key) => goView(key)} />
      </Box>
      {showChips && (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 0.5 }}>
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
      <Box sx={{ mt: 3 }}>{body}</Box>
    </>
  );
}
