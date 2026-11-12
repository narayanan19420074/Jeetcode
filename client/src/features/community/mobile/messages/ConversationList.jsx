import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { FriendRow } from '../../../friends/mobileFriends/MobileFriendsParts';
import { FONT_SIZES } from '../../../../app/design/designTokens';

const FRIENDS_PATH = '/dashboard?view=friends';

function EmptyInbox({ hasQuery }) {
  return (
    <Box sx={{ textAlign: 'center', px: 3, py: 6 }}>
      <Typography sx={{ fontSize: FONT_SIZES.title }}>{hasQuery ? 'No conversations match your search.' : 'No conversations yet'}</Typography>
      {!hasQuery && (
        <>
          <Typography sx={{ mt: 0.5, color: 'var(--lib-muted)', fontSize: FONT_SIZES.body }}>Add friends to start chatting with them.</Typography>
          <Button component={RouterLink} to={FRIENDS_PATH} sx={{ mt: 2 }}>Find friends</Button>
        </>
      )}
    </Box>
  );
}

// The inbox rows, drawn with the same row as the Friends page: photo with online dot, name, latest message, time and unread count.
export default function ConversationList({ conversations, loaded, myId, hasQuery, onOpen }) {
  if (!loaded) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress aria-label="Loading messages" /></Box>;
  if (conversations.length === 0) return <EmptyInbox hasQuery={hasQuery} />;
  return (
    <Box sx={{ px: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      {conversations.map(({ friend, last, unread, online }) => (
        <FriendRow key={friend.userId} f={friend} last={last} unread={unread} online={online} myId={myId} onOpen={() => onOpen(friend)} />
      ))}
    </Box>
  );
}
