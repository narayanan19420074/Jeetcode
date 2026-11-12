import { useMemo } from 'react';
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material';
import { FONT_SIZES } from '../../../../../app/design/designTokens';
import { libChipSx } from '../../../../dashboard/components/libraryStyle';
import { TypingDots } from '../../../../friends/chat/ChatBubbles';
import ChatIntro from './ChatIntro';
import ChatMessageRow from './ChatMessageRow';
import DayDivider from './DayDivider';
import describeMessages from './describeMessages';

function OlderMessagesButton({ isLoading, onLoad }) {
  return (
    <ButtonBase onClick={onLoad} disabled={isLoading} sx={{ ...libChipSx(false), alignSelf: 'center', mt: 2 }}>
      {isLoading ? 'Loading…' : 'Load earlier messages'}
    </ButtonBase>
  );
}

// The scrolling conversation. Short conversations sit at the bottom, next to the composer, as in LinkedIn.
export default function ChatThread({ friend, me, thread, scroll, onOpenProfile }) {
  const items = useMemo(() => describeMessages(thread.messages), [thread.messages]);
  const loadOlder = () => scroll.keepPositionWhile(thread.loadOlder);
  return (
    <Box ref={scroll.scrollerRef} onScroll={scroll.onScroll} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', display: 'flex', flexDirection: 'column', px: 2, pb: 2 }}>
      <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column' }}>
        {thread.isLoading && <CircularProgress aria-label="Loading messages" sx={{ alignSelf: 'center', my: 4 }} />}
        {thread.error && <Typography color="error" sx={{ textAlign: 'center', my: 4 }}>{thread.error}</Typography>}
        {!thread.isLoading && thread.hasMore && <OlderMessagesButton isLoading={thread.isLoadingMore} onLoad={loadOlder} />}
        {!thread.isLoading && !thread.hasMore && <Box sx={{ pt: 3 }}><ChatIntro friend={friend} onOpenProfile={onOpenProfile} /></Box>}
        {items.map((item) => (
          <Box key={item.message.id} sx={{ display: 'flex', flexDirection: 'column' }}>
            {item.startsDay && <DayDivider label={item.day} />}
            <ChatMessageRow item={item} friend={friend} me={me} />
          </Box>
        ))}
        {thread.isFriendTyping && <Typography role="status" aria-label={`${friend.name} is typing`} sx={{ mt: 2, fontSize: FONT_SIZES.body, color: 'var(--lib-muted)' }}>{friend.name.split(' ')[0]} is typing<TypingDots /></Typography>}
      </Box>
    </Box>
  );
}
