import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { adminApi } from '../../../api/adminApi';
import { extractErrorMessage } from '../../../api/apiClient';

const LIST_POLL_MS = 5000;
const CHAT_POLL_MS = 4000;
const when = (iso) => new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export default function AdminSupportChatPage() {
  const [status, setStatus] = useState('open');
  const [chats, setChats] = useState([]);
  const [unreadChats, setUnreadChats] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeId, setActiveId] = useState(null);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const lastAtRef = useRef(null);

  const loadList = useCallback(() => {
    return adminApi
      .listChats({ status, limit: 50 })
      .then(({ data }) => {
        setChats(data.data.items);
        setUnreadChats(data.data.unreadChats);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    setLoading(true);
    loadList();
    const t = setInterval(() => {
      if (!document.hidden) loadList();
    }, LIST_POLL_MS);
    return () => clearInterval(t);
  }, [loadList]);

  const merge = useCallback((incoming) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const add = incoming.filter((m) => !seen.has(m.id));
      return add.length ? [...prev, ...add] : prev;
    });
    lastAtRef.current = incoming[incoming.length - 1].createdAt;
  }, []);

  // Open a conversation.
  useEffect(() => {
    if (!activeId) return undefined;
    let cancelled = false;
    setActive(null);
    setMessages([]);
    lastAtRef.current = null;
    adminApi
      .getChat(activeId)
      .then(({ data }) => {
        if (cancelled) return;
        setActive(data.data.chat);
        setMessages(data.data.messages);
        lastAtRef.current = data.data.messages.at(-1)?.createdAt || null;
        loadList();
      })
      .catch((err) => !cancelled && setError(extractErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll the open conversation for new customer messages.
  useEffect(() => {
    if (!activeId || !active || active.status !== 'open') return undefined;
    const t = setInterval(() => {
      if (document.hidden) return;
      adminApi
        .getChat(activeId, lastAtRef.current || undefined)
        .then(({ data }) => merge(data.data.messages))
        .catch(() => {});
    }, CHAT_POLL_MS);
    return () => clearInterval(t);
  }, [activeId, active, merge]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const reply = async (e) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body || sending || !activeId) return;
    setSending(true);
    try {
      const { data } = await adminApi.sendChatMessage(activeId, body);
      merge([data.data.message]);
      setText('');
      loadList();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const closeChat = async () => {
    try {
      await adminApi.closeChat(activeId);
      setActive((a) => (a ? { ...a, status: 'closed' } : a));
      loadList();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const showThread = Boolean(activeId);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        Live Chat
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Conversations started from Help &amp; Support. New messages appear automatically.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '340px 1fr' }, gap: 2 }}>
        {/* Conversation list */}
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', display: { xs: showThread ? 'none' : 'block', md: 'block' } }}>
          <Tabs
            value={status}
            onChange={(e, v) => {
              setStatus(v);
              setActiveId(null);
            }}
            variant="fullWidth"
          >
            <Tab
              value="open"
              label={
                <Badge color="error" badgeContent={unreadChats} sx={{ '& .MuiBadge-badge': { right: -14 } }}>
                  Open
                </Badge>
              }
            />
            <Tab value="closed" label="Closed" />
          </Tabs>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={24} />
            </Box>
          ) : chats.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
              No {status} conversations.
            </Typography>
          ) : (
            <List disablePadding sx={{ maxHeight: { md: 560 }, overflowY: 'auto' }}>
              {chats.map((c) => (
                <ListItemButton key={c.id} selected={c.id === activeId} onClick={() => setActiveId(c.id)} divider alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: c.unreadForAgent ? 800 : 600 }} noWrap>
                          {c.user?.name || 'Deleted user'}
                        </Typography>
                        <Chip size="small" variant="outlined" label={c.topic} />
                        {c.unreadForAgent > 0 && <Chip size="small" color="error" label={c.unreadForAgent} />}
                      </Stack>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" noWrap component="span" sx={{ display: 'block' }}>
                          {c.lastMessageSender === 'agent' ? 'You: ' : ''}
                          {c.lastMessagePreview}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span">
                          {when(c.lastMessageAt)}
                        </Typography>
                      </>
                    }
                    slotProps={{ secondary: { component: 'div' } }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Paper>

        {/* Conversation */}
        <Paper variant="outlined" sx={{ borderRadius: 3, display: { xs: showThread ? 'flex' : 'none', md: 'flex' }, flexDirection: 'column', minHeight: 420, height: { md: 620 } }}>
          {!activeId ? (
            <Typography color="text.secondary" sx={{ p: 4 }}>
              Select a conversation to read and reply.
            </Typography>
          ) : !active ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              <Stack direction="row" spacing={1} sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', alignItems: 'center' }}>
                <IconButton onClick={() => setActiveId(null)} sx={{ display: { md: 'none' } }} aria-label="Back to conversations">
                  <ArrowBackRoundedIcon />
                </IconButton>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }} noWrap>
                    {active.user ? `${active.user.name} (@${active.user.handle})` : 'Deleted user'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {active.user?.email} · {active.topic} · started {when(active.createdAt)}
                  </Typography>
                </Box>
                {active.status === 'open' ? (
                  <Button size="small" color="inherit" variant="outlined" onClick={closeChat}>
                    Close chat
                  </Button>
                ) : (
                  <Chip size="small" label="Closed" />
                )}
              </Stack>

              <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                <Stack spacing={1.25}>
                  {messages.map((m) => {
                    const agent = m.sender === 'agent';
                    return (
                      <Box key={m.id} sx={{ display: 'flex', justifyContent: agent ? 'flex-end' : 'flex-start' }}>
                        <Box sx={{ maxWidth: '80%', px: 1.5, py: 1, borderRadius: 2, bgcolor: agent ? 'primary.main' : 'action.hover', color: agent ? 'primary.contrastText' : 'text.primary' }}>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {m.text}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', opacity: 0.7, mt: 0.25 }}>
                            {agent ? `${m.agentName} · ` : ''}
                            {when(m.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                  <div ref={endRef} />
                </Stack>
              </Box>

              {active.status === 'open' ? (
                <Box component="form" onSubmit={reply} sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) reply(e);
                    }}
                    placeholder="Type a reply. Press Enter to send, Shift+Enter for a new line."
                    size="small"
                    multiline
                    maxRows={5}
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 2000, 'aria-label': 'Reply' } }}
                  />
                  <IconButton type="submit" color="primary" disabled={sending || !text.trim()} aria-label="Send reply">
                    <SendRoundedIcon />
                  </IconButton>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  This conversation is closed.
                </Typography>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
