import { useEffect, useRef, useState } from 'react';
import { Box, Stack, Typography, TextField } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { wsSurface } from '../workspace/workspaceTheme';
import { EmptyState, WsIconButton } from '../workspace/wsUi';
import { WS } from '../workspace/wsTokens';

// Pair-room chat, styled with the workspace UI kit (same radius, tones and buttons).
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
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: (t) => wsSurface(t).chrome }}>
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1.5 }}>
        {messages.length === 0 && (
          <EmptyState
            icon={<ForumOutlinedIcon />}
            title="No messages yet"
            text={`${friendName ? `Say hi to ${friendName}. ` : ''}Share doubts, links or ideas with your partner here.`}
          />
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
                  py: 1,
                  borderRadius: mine ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  bgcolor: mine ? 'primary.main' : wsSurface(t).raised,
                  color: mine ? 'primary.contrastText' : 'text.primary',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                })}
              >
                {m.text}
              </Box>
            </Box>
          );
        })}
        <div ref={endRef} />
      </Box>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, px: 2, pt: 0.5, pb: 1.5 }}>
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
          slotProps={{ input: { sx: (t) => ({ borderRadius: `${WS.radius}px`, height: WS.ctrlLg, bgcolor: wsSurface(t).raised, '& fieldset': { border: 'none' } }) } }}
        />
        <WsIconButton
          title="Send"
          size="lg"
          onClick={send}
          disabled={disabled || !text.trim()}
          sx={(t) => ({
            color: t.palette.primary.contrastText,
            bgcolor: t.palette.primary.main,
            '&:hover': { bgcolor: t.palette.primary.dark, color: t.palette.primary.contrastText },
            '&.Mui-disabled': { bgcolor: t.palette.action.disabledBackground, color: t.palette.text.disabled },
          })}
        >
          <SendRoundedIcon />
        </WsIconButton>
      </Stack>
    </Box>
  );
}
