import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import FriendRequestRow from './FriendRequestRow';
import MessageRow from './MessageRow';
import { EMPTY_INBOX_COPY, INBOX_TAB } from './inboxTabs';
import { FONT_SIZES } from '../../../../app/design/designTokens';

// Players are found and added from the Leaderboard (search a name or @handle, open the player and choose Add friend).
const FIND_FRIENDS_PATH = '/dashboard?view=leaderboard';

function EmptyInbox({ tab, hasQuery }) {
  const copy = EMPTY_INBOX_COPY[tab];
  return (
    <Box sx={{ textAlign: 'center', px: 3, py: 6 }}>
      <Typography sx={{ fontSize: FONT_SIZES.title }}>{hasQuery ? 'No conversations match your search.' : copy.title}</Typography>
      {!hasQuery && <Typography sx={{ mt: 0.5, color: 'var(--lib-muted)', fontSize: FONT_SIZES.body }}>{copy.hint}</Typography>}
      {!hasQuery && tab === INBOX_TAB.primary && <Button component={RouterLink} to={FIND_FRIENDS_PATH} sx={{ mt: 2 }}>Find friends</Button>}
    </Box>
  );
}

// The inbox rows: photo with online dot, name, latest message, time and unread count. The Requests tab lists friend
// requests first, so they are answered before anything else.
export default function ConversationList({ conversations, friendRequests, loaded, myId, tab, hasQuery, onOpen }) {
  if (!loaded) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress aria-label="Loading messages" /></Box>;
  if (conversations.length === 0 && friendRequests.length === 0) return <EmptyInbox tab={tab} hasQuery={hasQuery} />;
  return (
    <Box sx={{ px: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      {friendRequests.map((request) => <FriendRequestRow key={request.requestId} request={request} />)}
      {conversations.map(({ friend, last, unread, online }) => (
        <MessageRow key={friend.userId} friend={friend} last={last} unread={unread} online={online} myId={myId} onOpen={() => onOpen(friend)} />
      ))}
    </Box>
  );
}
