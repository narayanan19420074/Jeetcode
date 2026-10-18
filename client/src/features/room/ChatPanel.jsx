import { useEffect, useRef, useState } from 'react';
import { Box, Stack, Typography, TextField, IconButton } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { alpha } from '@mui/material/styles';

export default function ChatPanel({ messages, myId, onSend, disabled }) {
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {messages.length === 0 && (
          <Stack sx={{ alignItems: 'center', textAlign: 'center', gap: 1, py: 5, px: 2 }}>
            <Box sx={(t) => ({ width: 52, height: 52, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: alpha(t.palette.primary.main, 0.12), color: 'primary.main' })}>
              <ForumOutlinedIcon />
            </Box>
            <Typography sx={{ fontWeight: 700 }}>No messages yet</Typography>
            <Typography variant="body2" color="text.secondary">
              Share doubts, links or ideas with your partner here.
            </Typography>
          </Stack>
        )}
        {messages.map((m) => {
          const mine = m.from === myId;
          return (
            <Box key={m.id} sx={{ mb: 1, textAlign: mine ? 'right' : 'left' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {mine ? 'You' : m.name}
              </Typography>
              <Box
                sx={{
                  display: 'inline-block',
                  maxWidth: '90%',
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: mine ? 'primary.main' : 'action.hover',
                  color: mine ? 'primary.contrastText' : 'text.primary',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {m.text}
              </Box>
            </Box>
          );
        })}
        <div ref={endRef} />
      </Box>
      <Stack direction="row" spacing={1} sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <IconButton color="primary" onClick={send} disabled={disabled || !text.trim()}>
          <SendRoundedIcon />
        </IconButton>
      </Stack>
    </Box>
  );
}
