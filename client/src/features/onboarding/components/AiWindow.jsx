import { useEffect, useRef } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import BrandMark from '../../../components/BrandMark';
import ChatBubble from './ChatBubble';
import GeneratedCard from './GeneratedCard';
import TypingBox from './TypingBox';

function AiWindowHeader() {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', px: 2, py: 1.5, borderBottom: '1px solid var(--lib-divider)' }}>
      <BrandMark size={32} />
      <Typography component="h1" sx={{ fontWeight: 650 }}>
        JeetCode Assistant
      </Typography>
    </Stack>
  );
}

// Keeps the newest message or card in view as the conversation grows.
function useScrollToLatest(dependencies) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, dependencies);
  return endRef;
}

// Full-screen assistant: conversation, the card being asked, and the typing box.
export default function AiWindow({ flow, onFinish }) {
  const { messages, step, selectOption, sendText } = flow;
  const endRef = useScrollToLatest([messages.length, step]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 640, mx: 'auto', bgcolor: 'var(--lib-bg)' }}>
      <AiWindowHeader />
      <Stack spacing={1.5} aria-live="polite" sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        <GeneratedCard step={step} onSelect={selectOption} onFinish={onFinish} />
        <div ref={endRef} />
      </Stack>
      <Box sx={{ p: 2, pb: 'calc(16px + env(safe-area-inset-bottom))' }}>
        <TypingBox disabled={!step || step.kind === 'roadmap'} onSend={sendText} />
      </Box>
    </Box>
  );
}
