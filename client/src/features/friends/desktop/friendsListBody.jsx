import ActivityFeed from '../ActivityFeed';
import { Alert, Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { EmptyNote, FriendRow, OnlineRail, PersonRow, Reveal, SectionLabel, SkeletonRows } from '../friendsKit';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';
import MarkunreadRoundedIcon from '@mui/icons-material/MarkunreadRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import ScheduleSendRoundedIcon from '@mui/icons-material/ScheduleSendRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { WS } from '../../workspace/wsTokens';
import WifiTetheringRoundedIcon from '@mui/icons-material/WifiTetheringRounded';
import { WsIconButton } from '../../workspace/wsUi';
import { acceptFriendRequest, cancelFriendRequest, declineFriendRequest, fetchFriends, sendFriendRequest } from '../friendsSlice';
import { practisedToday, timeAgo } from '../friendsUi';
import { wsSurface } from '../../workspace/workspaceTheme';
import { pillBtn, tint } from './friendsStyle';

export function renderFriendsList(c) {
  const { acting, busy, chatId, codeTogether, desktop, dispatch, error, favs, filter, friendIds, friends, global, globalOn, incoming, isOnline, last, link, loaded, loading, nameMatch, needle, noFriends, nudge, online, onlineCount, onlineFriends, openChat, outgoing, players, received, run, sentIds, setChatId, setConfirm, share, shownFriends, title, toggleFav, unread, user, view } = c;
  // ---- action cell for a player who is not a friend (or is, in the find list)
  const playerAction = (p) => {
    if (friendIds.has(p.userId)) {
      return <WsIconButton title="Chat" onClick={() => openChat(p.userId)} sx={tint('primary')}><ChatRoundedIcon /></WsIconButton>;
    }
    if (sentIds.has(p.userId)) {
      return (
        <Tooltip title="Waiting for them to accept">
          <Box component="span" sx={(t) => ({ display: 'inline-flex', alignItems: 'center', gap: 0.5, height: 32, px: 1.5, borderRadius: `${WS.radius + 2}px`, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, whiteSpace: 'nowrap', color: 'text.secondary', bgcolor: wsSurface(t).raised, '& svg': { fontSize: FONT_SIZES.title } })}>
            <ScheduleSendRoundedIcon />Request sent
          </Box>
        </Tooltip>
      );
    }
    if (received.has(p.userId)) {
      return (
        <Button size="small" disableElevation disabled={busy === p.userId} onClick={() => run(p.userId, acceptFriendRequest(received.get(p.userId)), 'Friend added')} startIcon={<CheckRoundedIcon sx={{ fontSize: `${FONT_SIZES.iconCompact} !important` }} />} sx={pillBtn('success')}>
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
        startIcon={<PersonAddAlt1RoundedIcon sx={{ fontSize: `${FONT_SIZES.iconCompact} !important` }} />}
        sx={pillBtn('primary')}
      >
        Add friend
      </Button>
    );
  };

  const playerRows = (withRank) => players.map((p, i) => (
    <Reveal key={p.userId} index={i}>
      <PersonRow person={p} rank={withRank ? p.rank : null} sub={`@${p.handle} · ${p.score.toLocaleString()} pts`} action={playerAction(p)} />
    </Reveal>
  ));
  const playerFooter = (
    <>
      {global.rows === null && global.loading && <SkeletonRows count={5} />}
      {global.error && <Typography sx={{ px: 2, py: 1.5, fontSize: FONT_SIZES.body, color: 'text.secondary' }}>{global.error}</Typography>}
      {global.hasMore && (
        <Box sx={{ textAlign: 'center', py: 1.5 }}>
          <Button size="small" onClick={global.loadMore} disabled={global.loading} sx={{ textTransform: 'none', fontWeight: FONT_WEIGHTS.semibold }}>{global.loading ? 'Loading…' : 'Show more players'}</Button>
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
        <SectionLabel right={rows.length > 0 ? <Typography sx={{ fontSize: FONT_SIZES.caption, color: 'text.disabled', fontWeight: FONT_WEIGHTS.semibold }}>{rows.length}</Typography> : null}>Friend requests</SectionLabel>
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
        <SectionLabel right={rows.length > 0 ? <Typography sx={{ fontSize: FONT_SIZES.caption, color: 'text.disabled', fontWeight: FONT_WEIGHTS.semibold }}>{rows.length}</Typography> : null}>Sent requests</SectionLabel>
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
  return body;
}
