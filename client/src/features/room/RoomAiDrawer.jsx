import { useEffect, useRef, useState } from 'react';
import { Box, Chip, CircularProgress, Drawer, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { aiApi } from '../../api/aiApi';
import { extractErrorMessage } from '../../api/apiClient';
import { PaneBar, WsIconButton } from '../workspace/wsUi';
import { WS } from '../workspace/wsTokens';
import { wsSurface } from '../workspace/workspaceTheme';

const QUICK_PROMPTS = ['Give me a hint', 'What is the time complexity?', 'Which edge cases should I test?'];

const WELCOME = {
  role: 'assistant',
  text: "I'm here to help you think through the problem — ask about an approach, an edge case, or a complexity trade-off. I won't hand you the full solution. This chat is private to you.",
};

// Same AI assistant as the workspace. It reads the shared code, but the chat is yours alone.
export default function RoomAiDrawer({ open, onClose, slug, language, getCode, isAuthenticated, onSignIn }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading, open]);

  const send = async () => {
    const question = input.trim();
    if (!question || loading || !slug) return;
    if (!isAuthenticated) {
      onSignIn();
      return;
    }
    const history = messages.slice(-6);
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await aiApi.hint({ problemSlug: slug, language, code: getCode(), question, history });
      setMessages((prev) => [...prev, { role: 'assistant', text: data.data.hint }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: extractErrorMessage(err) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} slotProps={{ paper: { sx: { width: 'min(400px, 100vw)', borderRadius: 0 } } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <PaneBar height={56} sx={{ px: 2, gap: 1.25, pt: 'env(safe-area-inset-top)', boxSizing: 'content-box' }}>
          <Box sx={(t) => ({ width: 32, height: 32, borderRadius: `${WS.radius}px`, display: 'grid', placeItems: 'center', bgcolor: alpha(t.palette.primary.main, 0.14), color: 'primary.main' })}>
            <AutoAwesomeRoundedIcon sx={{ fontSize: 19 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '0.95rem' }}>AI Assistant</Typography>
            <Typography variant="caption" color="text.secondary">
              Hints only, no full solutions
            </Typography>
          </Box>
          {messages.length > 1 && (
            <WsIconButton title="Clear chat" onClick={() => setMessages([WELCOME])}>
              <DeleteSweepOutlinedIcon />
            </WsIconButton>
          )}
          <WsIconButton title="Close" onClick={onClose}>
            <CloseRoundedIcon />
          </WsIconButton>
        </PaneBar>

        <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1.5 }}>
          <Stack sx={{ gap: 1.25 }}>
            {messages.map((m, i) => (
              <Box
                key={i}
                sx={(t) => ({
                  px: 1.5,
                  py: 1.1,
                  borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  bgcolor: m.role === 'user' ? 'primary.main' : wsSurface(t).raised,
                  color: m.role === 'user' ? 'primary.contrastText' : 'text.primary',
                  ml: m.role === 'user' ? 5 : 0,
                  mr: m.role === 'user' ? 0 : 5,
                })}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
                  {m.text}
                </Typography>
              </Box>
            ))}
            {loading && (
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <CircularProgress size={14} />
                <Typography variant="body2">Thinking…</Typography>
              </Stack>
            )}
            <div ref={endRef} />
          </Stack>
        </Box>

        <Box sx={{ px: 2, pt: 1, pb: 'calc(14px + env(safe-area-inset-bottom))' }}>
          <Stack direction="row" sx={{ gap: 0.75, mb: 1.25, overflowX: 'auto', pb: 0.25 }}>
            {QUICK_PROMPTS.map((p) => (
              <Chip
                key={p}
                clickable
                size="small"
                label={p}
                onClick={() => setInput(p)}
                sx={(t) => ({ flexShrink: 0, borderRadius: `${WS.radius}px`, bgcolor: wsSurface(t).raised, fontWeight: 600 })}
              />
            ))}
          </Stack>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Ask for a hint, not the answer..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && send()}
              disabled={loading}
              slotProps={{ input: { sx: (t) => ({ borderRadius: `${WS.radius}px`, height: WS.ctrlLg, bgcolor: wsSurface(t).raised, '& fieldset': { border: 'none' } }) } }}
            />
            <WsIconButton
              title="Send"
              size="lg"
              onClick={send}
              disabled={loading || !input.trim()}
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
      </Box>
    </Drawer>
  );
}
