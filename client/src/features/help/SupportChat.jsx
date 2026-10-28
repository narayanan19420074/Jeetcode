import { useCallback, useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Badge, Box, Button, Chip, CircularProgress, Fab, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import { supportChatApi } from '../../api/supportChatApi';
import { extractErrorMessage } from '../../api/apiClient';

const TOPICS = [
  { value: 'payment', label: 'Payments & Pro' },
  { value: 'account', label: 'Account & login' },
  { value: 'technical', label: 'Technical issue' },
  { value: 'other', label: 'Something else' },
];

const OPEN_POLL_MS = 4000; // while the chat window is open
const IDLE_POLL_MS = 30000; // while closed, only to refresh the unread badge

const timeLabel = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function Bubble({ m }) {
  const mine = m.sender === 'user';
  return (
    <Box sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
      <Box
        sx={{
          maxWidth: '82%',
          px: 1.5,
          py: 1,
          borderRadius: 2,
          bgcolor: mine ? 'primary.main' : 'action.hover',
          color: mine ? 'primary.contrastText' : 'text.primary',
          borderBottomRightRadius: mine ? 4 : undefined,
          borderBottomLeftRadius: mine ? undefined : 4,
        }}
      >
        {!mine && (
          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', opacity: 0.8 }}>
            {m.agentName || 'JeetCode Support'}
          </Typography>
        )}
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {m.text}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', opacity: 0.7, mt: 0.25 }}>
          {timeLabel(m.createdAt)}
        </Typography>
      </Box>
    </Box>
  );
}

// Floating "Chat with support" launcher + chat window. Signed-in users only.
// `open` / `onOpenChange` are controlled by the page so other buttons can open the chat too.
export default function SupportChat({ open, onOpenChange }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [unread, setUnread] = useState(0);
  const endRef = useRef(null);
  const lastAtRef = useRef(null);

  const merge = useCallback((incoming) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const add = incoming.filter((m) => !seen.has(m.id));
      return add.length ? [...prev, ...add] : prev;
    });
    lastAtRef.current = incoming[incoming.length - 1].createdAt;
  }, []);

  // Initial load whenever the window opens.
  useEffect(() => {
    if (!open || !isAuthenticated) return undefined;
    let cancelled = false;
    setLoading(true);
    setError('');
    supportChatApi
      .get()
      .then(({ data }) => {
        if (cancelled) return;
        setChat(data.data.chat);
        setMessages(data.data.messages);
        lastAtRef.current = data.data.messages.at(-1)?.createdAt || null;
        setUnread(0);
      })
      .catch((err) => !cancelled && setError(extractErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, isAuthenticated]);

  // Poll for new agent replies while open.
  useEffect(() => {
    if (!open || !isAuthenticated || !chat) return undefined;
    const t = setInterval(() => {
      if (document.hidden) return;
      supportChatApi
        .get(lastAtRef.current || undefined)
        .then(({ data }) => {
          if (!data.data.chat) {
            setChat(null); // the support team closed the conversation
            return;
          }
          merge(data.data.messages);
        })
        .catch(() => {});
    }, OPEN_POLL_MS);
    return () => clearInterval(t);
  }, [open, isAuthenticated, chat, merge]);

  // Unread badge on the launcher while the window is closed.
  useEffect(() => {
    if (open || !isAuthenticated) return undefined;
    const check = () => {
      if (document.hidden) return;
      supportChatApi.unread().then(({ data }) => setUnread(data.data.unread)).catch(() => {});
    };
    check();
    const t = setInterval(check, IDLE_POLL_MS);
    return () => clearInterval(t);
  }, [open, isAuthenticated]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, open, loading]);

  const send = async (e) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError('');
    try {
      const { data } = await supportChatApi.send(body, chat ? undefined : topic || 'other');
      setChat(data.data.chat);
      merge([data.data.message]);
      setText('');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const endChat = async () => {
    try {
      await supportChatApi.close();
      setChat(null);
      setMessages([]);
      setTopic('');
      lastAtRef.current = null;
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) send(e);
  };

  return (
    <>
      {!open && (
        <Fab
          color="primary"
          variant="extended"
          onClick={() => onOpenChange(true)}
          aria-label="Chat with support"
          sx={{ position: 'fixed', right: 16, bottom: 'calc(16px + env(safe-area-inset-bottom))', zIndex: 1200, fontWeight: 700, textTransform: 'none' }}
        >
          <Badge color="error" badgeContent={unread} invisible={!unread} sx={{ mr: 1 }}>
            <ChatRoundedIcon />
          </Badge>
          Chat with us
        </Fab>
      )}

      {open && (
        <Paper
          elevation={8}
          role="dialog"
          aria-label="Support chat"
          sx={{
            position: 'fixed',
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            right: { xs: 0, sm: 16 },
            bottom: { xs: 0, sm: 16 },
            width: { xs: '100%', sm: 380 },
            height: { xs: '100dvh', sm: 560 },
            maxHeight: { sm: 'calc(100dvh - 32px)' },
            borderRadius: { xs: 0, sm: 3 },
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ p: 1.5, bgcolor: 'primary.main', color: 'primary.contrastText', alignItems: 'center' }}>
            <SupportAgentRoundedIcon />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>JeetCode Support</Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                We usually reply within one working day
              </Typography>
            </Box>
            {chat && (
              <Button size="small" color="inherit" onClick={endChat} sx={{ textTransform: 'none', fontWeight: 600 }}>
                End chat
              </Button>
            )}
            <IconButton size="small" color="inherit" onClick={() => onOpenChange(false)} aria-label="Close chat">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          {!isAuthenticated ? (
            <Stack spacing={2} sx={{ p: 3, flex: 1, justifyContent: 'center', textAlign: 'center', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 700 }}>Sign in to chat with our team</Typography>
              <Typography variant="body2" color="text.secondary">
                Chat is available to signed-in users so we can look up your account. You can also send us a message using the contact form on this page.
              </Typography>
              <Button component={RouterLink} to="/login" variant="contained" disableElevation sx={{ fontWeight: 700 }}>
                Sign in
              </Button>
            </Stack>
          ) : (
            <>
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <Stack spacing={1.25}>
                    <Box sx={{ alignSelf: 'flex-start', maxWidth: '88%', px: 1.5, py: 1, borderRadius: 2, bgcolor: 'action.hover' }}>
                      <Typography variant="body2">
                        Hi{user?.name ? ` ${user.name.split(' ')[0]}` : ''}, how can we help you today?
                      </Typography>
                    </Box>

                    {!chat && messages.length === 0 && (
                      <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
                        {TOPICS.map((t) => (
                          <Chip
                            key={t.value}
                            label={t.label}
                            clickable
                            color={topic === t.value ? 'primary' : 'default'}
                            variant={topic === t.value ? 'filled' : 'outlined'}
                            onClick={() => setTopic(t.value)}
                          />
                        ))}
                      </Stack>
                    )}

                    {messages.map((m) => (
                      <Bubble key={m.id} m={m} />
                    ))}

                    {!chat && messages.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                        This conversation has ended. Send a message to start a new one.
                      </Typography>
                    )}
                    <div ref={endRef} />
                  </Stack>
                )}
              </Box>

              {error && (
                <Typography variant="caption" color="error" sx={{ px: 2, pt: 1 }}>
                  {error}
                </Typography>
              )}
              <Box component="form" onSubmit={send} sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type your message"
                  size="small"
                  multiline
                  maxRows={4}
                  fullWidth
                  slotProps={{ htmlInput: { maxLength: 2000, 'aria-label': 'Message' } }}
                />
                <IconButton type="submit" color="primary" disabled={sending || !text.trim()} aria-label="Send message">
                  <SendRoundedIcon />
                </IconButton>
              </Box>
            </>
          )}
        </Paper>
      )}
    </>
  );
}
