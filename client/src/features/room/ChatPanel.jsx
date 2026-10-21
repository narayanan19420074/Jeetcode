import { useEffect, useRef, useState } from 'react';
import { Box, Stack, Typography, TextField, IconButton } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { wsSurface } from '../workspace/workspaceTheme';

export default function ChatPanel({ messages, myId, onSend, disabled, friendName }) {
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const send = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
  };

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {messages.length === 0 && (
          <Stack sx={{ alignItems: 'center', textAlign: 'center', gap: 1, py: 5, px: 2 }}>
            <Box sx={(t) => ({ width: 52, height: 52, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: wsSurface(t).raised, color: 'primary.main' })}>
              <ForumOutlinedIcon />
            </Box>
            <Typography sx={{ fontWeight: 700 }}>No messages yet</Typography>
            <Typography variant="body2" color="text.secondary">
              {friendName ? `Say hi to ${friendName}. ` : ''}Share doubts, links or ideas with your partner here.
            </Typography>
          </Stack>
        )}
        {messages.map((m) => {
          const mine = m.from === myId;
          return (
            <Box key={m.id} sx={{ mb: 1.25, textAlign: mine ? 'right' : 'left' }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25 }}>
                {mine ? 'You' : m.name}
              </Typography>
              <Box
                sx={(t) => ({
                  display: 'inline-block',
                  maxWidth: '88%',
                  px: 1.5,
                  py: 0.9,
                  borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  bgcolor: mine ? 'primary.main' : wsSurface(t).raised,
                  color: mine ? 'primary.contrastText' : 'text.primary',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                })}
              >
                {m.text}
              </Box>
            </Box>
          );
        })}
        <div ref={endRef} />
      </Box>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, p: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
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
          sx={(t) => ({ '& .MuiOutlinedInput-root': { borderRadius: 999, bgcolor: wsSurface(t).raised, '& fieldset': { border: 0 } } })}
        />
        <IconButton
          aria-label="Send message"
          onClick={send}
          disabled={disabled || !text.trim()}
          sx={{ width: 42, height: 42, flexShrink: 0, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
        >
          <SendRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Stack>
    </Box>
  );
}
