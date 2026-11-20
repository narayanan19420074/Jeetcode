import { Box } from '@mui/material';
import ActivityFeed from './ActivityFeed';

// Friend activity inside the chat window: it replaces the messages while the Activity icon in the chat header is on.
export default function ActivityPanel() {
  return (
    <Box data-chat-scroll className="autohide-scroll" sx={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', pb: 2 }}>
      <ActivityFeed />
    </Box>
  );
}
