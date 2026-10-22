import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Box, Button, CircularProgress, Drawer, IconButton, Stack, TextField, Tooltip, Typography, alpha } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { friendsApi } from '../../api/friendsApi';
import { roomApi } from '../../api/roomApi';
import { extractErrorMessage } from '../../api/apiClient';
import { clearUnread, setActiveChat } from './friendsSlice';
import { getFriendsSocket } from './friendsRealtime';
import { FLAME, PersonAvatar, dayLabel, statusInfo } from './friendsUi';

const clock = (iso) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const addUnique = (list, m) => (list.some((x) => x.id === m.id) ? list : [...list, m]);

// Tiny "typing" dots
function TypingDots() {
  return (
    <Box sx={{ display: 'inline-flex', gap: '3px', ml: 0.5, verticalAlign: 'middle' }} aria-hidden>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 4, height: 4, borderRadius: '50%', bgcolor: 'currentColor',
            animation: 'jcDot 1.1s infinite', animationDelay: `${i * 0.15}s`,
            '@keyframes jcDot': { '0%,60%,100%': { opacity: 0.25, transform: 'translateY(0)' }, '30%': { opacity: 1, transform: 'translateY(-2px)' } },
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
      ))}
    </Box>
  );
}

// "@friend nudged you" — warm flame card
function NudgeCard({ m, mine, friend }) {
  return (
    <Box
      sx={{
        alignSelf: 'center', width: '100%', maxWidth: 330, p: 1.5, borderRadius: '16px', textAlign: 'center',
        color: '#fff', background: `linear-gradient(135deg, ${FLAME}, #EF4444)`,
        boxShadow: `0 10px 24px -12px ${alpha(FLAME, 0.8)}`,
      }}
    >
      <LocalFireDepartmentRoundedIcon sx={{ fontSize: 30 }} />
      <Typography sx={{ fontWeight: 800, lineHeight: 1.25 }}>{mine ? `You nudged @${friend.handle}` : `@${friend.handle} nudged you`}</Typography>
      <Typography variant="body2" sx={{ opacity: 0.95, mt: 0.25 }}>{m.text}</Typography>
      <Typography variant="caption" sx={{ opacity: 0.8 }}>{clock(m.createdAt)}</Typography>
    </Box>
  );
}

// "Let's code together" invite with a Join button (rooms are temporary — we check before joining).
function RoomCard({ m, mine, friend }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [busy, setBusy] = useState(false);
  const join = async () => {
    setBusy(true);
    try {
      await roomApi.get(m.roomId);
      navigate(`/room/${m.roomId}`);
    } catch {
      enqueueSnackbar('That room has expired. Ask for a fresh invite.', { variant: 'info' });
      setBusy(false);
    }
  };
  return (
    <Box
      sx={(t) => ({
        alignSelf: mine ? 'flex-end' : 'flex-start', width: '100%', maxWidth: 330, p: 1.5, borderRadius: '16px',
        border: `1px solid ${alpha(t.palette.primary.main, 0.4)}`,
        background: `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.14)}, ${alpha(t.palette.secondary?.main || t.palette.primary.main, 0.08)})`,
      })}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box sx={(t) => ({ width: 42, height: 42, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: t.palette.primary.main, color: t.palette.primary.contrastText })}>
          <LaptopMacRoundedIcon />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>Code together</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {mine ? `You invited @${friend.handle}` : `@${friend.handle} invited you`}{m.roomTitle ? ` · ${m.roomTitle}` : ''}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.25 }}>
        <Typography variant="caption" color="text.secondary">{clock(m.createdAt)}</Typography>
        <Button size="small" variant="contained" disableElevation disabled={busy} onClick={join} sx={{ borderRadius: 999, fontWeight: 700, px: 2 }}>
          {busy ? 'Checking…' : mine ? 'Rejoin room' : 'Join room'}
        </Button>
      </Stack>
    </Box>
  );
}

function Bubble({ m, mine, groupedAbove }) {
  return (
    <Box sx={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '82%', mt: groupedAbove ? -0.25 : 0 }}>
      <Box
        sx={(t) => ({
          px: 1.5, py: 0.9, borderRadius: mine ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
          ...(mine
            ? { color: t.palette.primary.contrastText, background: `linear-gradient(135deg, ${t.palette.primary.main}, ${alpha(t.palette.primary.main, 0.82)})` }
            : { bgcolor: t.palette.action.hover, color: t.palette.text.primary }),
          wordBreak: 'break-word', whiteSpace: 'pre-wrap',
        })}
      >
        <Typography variant="body2" sx={{ lineHeight: 1.45 }}>{m.text}</Typography>
      </Box>
      <Stack direction="row" spacing={0.4} alignItems="center" justifyContent={mine ? 'flex-end' : 'flex-start'} sx={{ mt: 0.25, px: 0.5, color: 'text.disabled' }}>
        <Typography variant="caption" sx={{ fontSize: 11 }}>{clock(m.createdAt)}</Typography>
        {mine && (m.readAt ? <DoneAllRoundedIcon sx={{ fontSize: 14, color: 'primary.main' }} aria-label="Seen" /> : <DoneRoundedIcon sx={{ fontSize: 14 }} aria-label="Sent" />)}
      </Stack>
    </Box>
  );
}

// `actions`: extra header icons (used by the desktop side panel). No `onClose` = no close button (always-open panel).
export function ChatPanel({ friend, onClose, onCodeTogether, actions }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const myId = useSelector((s) => s.auth.user?.id);
  const online = useSelector((s) => Boolean(s.friends.online[friend.userId]));
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const scroller = useRef(null);
  const stick = useRef(true); // keep the view pinned to the newest message unless the user scrolled up
  const typingTimer = useRef(null);
  const lastTypingSent = useRef(0);

  const markRead = useCallback(() => {
    dispatch(clearUnread(friend.userId));
    friendsApi.chatRead(friend.userId).catch(() => {});
  }, [dispatch, friend.userId]);

  // open: tell the app this chat is on screen, load history, mark read
  useEffect(() => {
    dispatch(setActiveChat(friend.userId));
    let cancelled = false;
    setLoading(true);
    friendsApi
      .chatHistory(friend.userId)
      .then(({ data }) => {
        if (cancelled) return;
        setMessages(data.data.messages);
        setHasMore(data.data.hasMore);
        setError('');
        markRead();
      })
      .catch((err) => !cancelled && setError(extractErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
      dispatch(setActiveChat(null));
    };
  }, [friend.userId, dispatch, markRead]);

  // live events for this conversation
  useEffect(() => {
    const s = getFriendsSocket();
    if (!s) return undefined;
    const onNew = (m) => {
      if (m.from !== friend.userId && m.to !== friend.userId) return;
      setMessages((prev) => addUnique(prev, m));
      if (m.from === friend.userId) {
        setTyping(false);
        markRead();
      }
    };
    const onRead = ({ by }) => {
      if (by === friend.userId) setMessages((prev) => prev.map((m) => (m.from === myId && !m.readAt ? { ...m, readAt: new Date().toISOString() } : m)));
    };
    const onTyping = ({ from }) => {
      if (from !== friend.userId) return;
      setTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(false), 3000);
    };
    s.on('dm:new', onNew);
    s.on('dm:read', onRead);
    s.on('dm:typing', onTyping);
    return () => {
      s.off('dm:new', onNew);
      s.off('dm:read', onRead);
      s.off('dm:typing', onTyping);
      clearTimeout(typingTimer.current);
    };
  }, [friend.userId, myId, markRead]);

  // keep pinned to the bottom on new messages
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, typing, loading]);

  const onScroll = () => {
    const el = scroller.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const loadOlder = async () => {
    if (!messages.length || loadingMore) return;
    setLoadingMore(true);
    const el = scroller.current;
    const prevHeight = el?.scrollHeight || 0;
    try {
      const { data } = await friendsApi.chatHistory(friend.userId, messages[0].createdAt);
      stick.current = false;
      setMessages((prev) => [...data.data.messages.filter((m) => !prev.some((x) => x.id === m.id)), ...prev]);
      setHasMore(data.data.hasMore);
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - prevHeight;
      });
    } catch (err) {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    } finally {
      setLoadingMore(false);
    }
  };

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    stick.current = true;
    const finish = (message) => {
      setMessages((prev) => addUnique(prev, message));
      setText('');
    };
    try {
      const s = getFriendsSocket();
      if (s?.connected) {
        const res = await new Promise((resolve) => {
          const t = setTimeout(() => resolve({ ok: false, error: 'timeout' }), 6000);
          s.emit('dm:send', { to: friend.userId, text: body }, (r) => { clearTimeout(t); resolve(r); });
        });
        if (res.ok) finish(res.message);
        else if (res.error === 'timeout') {
          const { data } = await friendsApi.chatSend(friend.userId, body); // socket unresponsive -> plain HTTP
          finish(data.data.message);
        } else enqueueSnackbar(res.error || 'Could not send', { variant: 'error' });
      } else {
        const { data } = await friendsApi.chatSend(friend.userId, body);
        finish(data.data.message);
      }
    } catch (err) {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    } finally {
      setSending(false);
    }
  };

  const onType = (e) => {
    setText(e.target.value.slice(0, 1000));
    const now = Date.now();
    if (now - lastTypingSent.current > 2500) {
      lastTypingSent.current = now;
      getFriendsSocket()?.emit('dm:typing', { to: friend.userId });
    }
  };

  const status = statusInfo(friend, online);
  let lastDay = '';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        sx={(t) => ({ px: 1.5, py: 1.25, borderBottom: `1px solid ${t.palette.divider}`, background: `linear-gradient(180deg, ${alpha(t.palette.primary.main, 0.08)}, transparent)` })}
      >
        <PersonAvatar person={friend} size={42} online={online} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: 800, lineHeight: 1.2 }}>{friend.name}</Typography>
          <Typography variant="caption" noWrap sx={{ display: 'block', color: typing || status.live ? 'success.main' : 'text.secondary', fontWeight: typing || status.live ? 700 : 400 }}>
            {typing ? <>typing<TypingDots /></> : status.text}
          </Typography>
        </Box>
        <Tooltip title="Code together">
          <IconButton aria-label="Code together" onClick={onCodeTogether} sx={(t) => ({ width: 40, height: 40, color: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.12) })}>
            <LaptopMacRoundedIcon />
          </IconButton>
        </Tooltip>
        {actions}
        {onClose && <IconButton aria-label="Close chat" onClick={onClose} sx={{ width: 40, height: 40 }}><CloseRoundedIcon /></IconButton>}
      </Stack>

      {/* messages */}
      <Box ref={scroller} onScroll={onScroll} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75, scrollbarWidth: 'thin' }}>
        {loading && <Box sx={{ m: 'auto' }}><CircularProgress size={26} /></Box>}
        {!loading && error && <Typography color="error" variant="body2" sx={{ m: 'auto', textAlign: 'center' }}>{error}</Typography>}
        {!loading && hasMore && (
          <Button size="small" onClick={loadOlder} disabled={loadingMore} sx={{ alignSelf: 'center', borderRadius: 999, textTransform: 'none', fontWeight: 700 }}>
            {loadingMore ? 'Loading…' : 'Load earlier messages'}
          </Button>
        )}
        {!loading && !error && messages.length === 0 && (
          <Stack alignItems="center" spacing={1} sx={{ m: 'auto', textAlign: 'center', color: 'text.secondary', px: 3 }}>
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 40, opacity: 0.6 }} />
            <Typography variant="body2">Say hi to {friend.name.split(' ')[0]} 👋<br />Or start a coding room together.</Typography>
          </Stack>
        )}
        {messages.map((m, i) => {
          const mine = m.from === myId;
          const day = dayLabel(m.createdAt);
          const showDay = day !== lastDay;
          lastDay = day;
          const prev = messages[i - 1];
          const groupedAbove = !showDay && prev && prev.from === m.from && prev.kind === 'text' && m.kind === 'text';
          return (
            <Box key={m.id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {showDay && (
                <Typography variant="caption" sx={(t) => ({ alignSelf: 'center', px: 1.25, py: 0.2, borderRadius: 999, bgcolor: t.palette.action.hover, color: 'text.secondary', fontWeight: 700, my: 0.5 })}>
                  {day}
                </Typography>
              )}
              {m.kind === 'nudge' ? <NudgeCard m={m} mine={mine} friend={friend} /> : m.kind === 'room' ? <RoomCard m={m} mine={mine} friend={friend} /> : <Bubble m={m} mine={mine} groupedAbove={groupedAbove} />}
            </Box>
          );
        })}
      </Box>

      {/* composer */}
      <Stack direction="row" alignItems="flex-end" spacing={1} sx={(t) => ({ p: 1.25, pb: 'calc(10px + env(safe-area-inset-bottom))', borderTop: `1px solid ${t.palette.divider}` })}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          size="small"
          placeholder={`Message @${friend.handle}`}
          value={text}
          onChange={onType}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '22px', py: 0.9, px: 1.75 } }}
          slotProps={{ htmlInput: { 'aria-label': `Message ${friend.name}`, maxLength: 1000 } }}
        />
        <IconButton
          aria-label="Send message"
          onClick={send}
          disabled={!text.trim() || sending}
          sx={(t) => ({ width: 44, height: 44, flexShrink: 0, color: t.palette.primary.contrastText, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { color: 'text.disabled', bgcolor: 'action.hover' } })}
        >
          {sending ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon sx={{ fontSize: 20 }} />}
        </IconButton>
      </Stack>
    </Box>
  );
}

// Right-side drawer (full screen on phones) that hosts one friend's chat.
export default function FriendChat({ friend, onClose, onCodeTogether }) {
  return (
    <Drawer
      anchor="right"
      open={Boolean(friend)}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 440 }, maxWidth: '100%', backgroundImage: 'none', borderRadius: { sm: '20px 0 0 20px' } } } }}
    >
      {friend && <ChatPanel key={friend.userId} friend={friend} onClose={onClose} onCodeTogether={() => onCodeTogether(friend)} />}
    </Drawer>
  );
}
