import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import MessageRow from './MessageRow';
import { EMPTY_INBOX_COPY, INBOX_TAB } from './inboxTabs';
import { FONT_SIZES } from '../../../../app/design/designTokens';

const FRIENDS_PATH = '/dashboard?view=friends';

function EmptyInbox({ tab, hasQuery }) {
  const copy = EMPTY_INBOX_COPY[tab];
  return (
    <Box sx={{ textAlign: 'center', px: 3, py: 6 }}>
      <Typography sx={{ fontSize: FONT_SIZES.title }}>{hasQuery ? 'No conversations match your search.' : copy.title}</Typography>
      {!hasQuery && <Typography sx={{ mt: 0.5, color: 'var(--lib-muted)', fontSize: FONT_SIZES.body }}>{copy.hint}</Typography>}
      {!hasQuery && tab === INBOX_TAB.primary && <Button component={RouterLink} to={FRIENDS_PATH} sx={{ mt: 2 }}>Find friends</Button>}
    </Box>
  );
}

// The inbox rows: photo with online dot, name, latest message, time and unread count.
export default function ConversationList({ conversations, loaded, myId, tab, hasQuery, onOpen }) {
  if (!loaded) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress aria-label="Loading messages" /></Box>;
  if (conversations.length === 0) return <EmptyInbox tab={tab} hasQuery={hasQuery} />;
  return (
    <Box sx={{ px: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      {conversations.map(({ friend, last, unread, online }) => (
        <MessageRow key={friend.userId} friend={friend} last={last} unread={unread} online={online} myId={myId} onOpen={() => onOpen(friend)} />
      ))}
    </Box>
  );
}
