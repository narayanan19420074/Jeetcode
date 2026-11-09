import ActivityFeed from './ActivityFeed';
import { Alert, Box, Button, ButtonBase, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../app/design/designTokens';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import { LIB_TRACKING, PageHeader, libBackBtnSx, libSearchSx } from '../dashboard/components/libraryStyle';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import { PersonAvatar, timeAgo } from './friendsUi';
import { Link as RouterLink } from 'react-router-dom';
import ScheduleSendRoundedIcon from '@mui/icons-material/ScheduleSendRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import { ACCENT, REQUEST_TABS, SUCCESS, scrollRow, smallBtn, tintIcon } from './mobileFriends/mobileFriendsStyle';
import { Empty, FriendRow, InviteBanner, PersonRow, Pills, SectionTitle, SkeletonRows } from './mobileFriends/MobileFriendsParts';
export { MobileShell } from './mobileFriends/MobileFriendsParts';

// Phone layout of the Friends page in the Library look (same as the phone Problems, Home and You pages):
// Roboto type, warm surface, 16px page padding, 40px icon buttons, centred header tile, 18px section titles,
// cream pills and divider-separated rows. The page itself scrolls and there is no top navigation bar on phones.
// The chat still opens in its own full-height drawer (FriendChat).

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
          <ScheduleSendRoundedIcon sx={{ fontSize: FONT_SIZES.subheading }} />
          <Typography sx={{ fontSize: FONT_SIZES.body, whiteSpace: 'nowrap' }}>Request sent</Typography>
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
        <Typography color="var(--lib-muted)" sx={{ py: 1.5, fontSize: FONT_SIZES.bodyLg }}>
          {global.error}
        </Typography>
      )}
      {global.hasMore && (
        <Box sx={{ textAlign: 'center', pt: 1.5 }}>
          <Button variant="outlined" onClick={global.loadMore} disabled={global.loading} sx={{ borderRadius: RADII_PX.pill, textTransform: 'none', fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, color: 'var(--lib-text)', borderColor: 'var(--lib-divider)' }}>
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
                  <Stack direction="row" sx={{ gap: 1 }}>
                    <IconButton disabled={busy === r.requestId} onClick={() => onAccept(r.requestId, r.requestId)} aria-label={`Accept request from ${r.user.name}`} sx={tintIcon(SUCCESS)}>
                      <CheckRoundedIcon />
                    </IconButton>
                    <IconButton disabled={busy === r.requestId} onClick={() => onDecline(r.requestId)} aria-label={`Decline request from ${r.user.name}`} sx={tintIcon(COLOR_PALETTE.slate[500])}>
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
                  <IconButton disabled={busy === r.requestId} onClick={() => onCancel(r.requestId)} aria-label={`Cancel request to ${r.user.name}`} sx={tintIcon(COLOR_PALETTE.slate[500])}>
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
                <ButtonBase key={p.userId} onClick={() => onOpenChat(p.userId)} aria-label={`Chat with ${p.name}, online`} sx={{ flexDirection: 'column', gap: 0.5, width: 64, flexShrink: 0, fontFamily: 'inherit' }}>
                  <PersonAvatar person={p} size={52} online />
                  <Typography noWrap color="var(--lib-muted)" sx={{ fontSize: FONT_SIZES.body, letterSpacing: LIB_TRACKING, width: '100%', textAlign: 'center' }}>
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
