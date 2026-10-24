import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Box, Button, CircularProgress, Drawer, IconButton, Popover, Stack, TextField, Typography, alpha } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { friendsApi } from '../../api/friendsApi';
import { roomApi } from '../../api/roomApi';
import { extractErrorMessage } from '../../api/apiClient';
import { WS } from '../workspace/wsTokens';
import { wsSurface } from '../workspace/workspaceTheme';
import { WsIconButton } from '../workspace/wsUi';
import { clearUnread, setActiveChat, setLast } from './friendsSlice';
import { getFriendsSocket } from './friendsRealtime';
import { FLAME, PersonAvatar, dayLabel, statusInfo } from './friendsUi';
import { PulseArt } from './friendsKit';

const clock = (iso) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const addUnique = (list, m) => (list.some((x) => x.id === m.id) ? list : [...list, m]);
const EMOJIS = ['👍', '🔥', '😂', '🙌', '👏', '💪', '🎯', '✅', '🤝', '😅', '🤔', '😎', '🙏', '🚀', '💡', '🎉'];

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

// Centered system line (day separators, nudges). Flat: a quiet tonal chip, no shadow.
const pill = (t) => ({ alignSelf: 'center', px: 1.5, py: 0.4, borderRadius: '999px', bgcolor: wsSurface(t).raised, color: t.palette.text.secondary, fontSize: 12, fontWeight: 600 });

// Flat card look shared by room invites and nudges.
const flatCard = (t) => ({ bgcolor: t.palette.background.paper, border: `1px solid ${t.palette.divider}` });

function NudgeLine({ m, mine, friend }) {
  return (
    <Box sx={(t) => ({ ...flatCard(t), alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 1.25, maxWidth: '88%', px: 1.75, py: 1, borderRadius: '14px', textAlign: 'left', color: t.palette.text.secondary })}>
      <LocalFireDepartmentRoundedIcon sx={{ fontSize: 20, color: FLAME, flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', lineHeight: 1.35 }}>{mine ? `You nudged @${friend.handle}` : `@${friend.handle} nudged you`}</Typography>
        <Typography sx={{ fontSize: 12.5, fontWeight: 400, lineHeight: 1.4 }}>{m.text}</Typography>
      </Box>
      <Typography sx={{ fontSize: 11, fontWeight: 400, alignSelf: 'flex-end', flexShrink: 0 }}>{clock(m.createdAt)}</Typography>
    </Box>
  );
}

// "Code together" invite with a Join button (rooms are temporary, so we check before joining).
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
    <Box sx={(t) => ({ ...flatCard(t), alignSelf: mine ? 'flex-end' : 'flex-start', width: '100%', maxWidth: 320, p: 1.5, my: 0.5, borderRadius: '14px', borderLeft: `3px solid ${t.palette.primary.main}` })}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box sx={(t) => ({ width: 40, height: 40, flexShrink: 0, borderRadius: '10px', display: 'grid', placeItems: 'center', bgcolor: alpha(t.palette.primary.main, 0.14), color: t.palette.primary.main })}>
          <LaptopMacRoundedIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.25 }}>Code together</Typography>
          <Typography noWrap sx={{ fontSize: 12, color: 'text.secondary' }}>
            {mine ? `You invited @${friend.handle}` : `@${friend.handle} invited you`}{m.roomTitle ? ` · ${m.roomTitle}` : ''}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 1.25 }}>
        <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{clock(m.createdAt)}</Typography>
        <Button size="small" variant="contained" disableElevation disabled={busy} onClick={join} sx={{ height: 30, borderRadius: `${WS.radius + 2}px`, fontWeight: 600, fontSize: 12.5, textTransform: 'none', px: 1.75 }}>
          {busy ? 'Checking…' : mine ? 'Rejoin room' : 'Join room'}
        </Button>
      </Stack>
    </Box>
  );
}

// Clean text bubble: flat colour, no tail, corners tighten inside a run of messages from the same person.
// `isNew` = arrived while the chat was open, so it pops in (history just appears).
function Bubble({ m, mine, first, endsRun, isNew }) {
  const reduce = useReducedMotion();
  const tight = 6;
  const round = 18;
  const top = first ? round : tight;
  const bottom = endsRun ? round : tight;
  return (
    <Box sx={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: { xs: '86%', sm: '76%' }, mt: first ? 2 : 0.5 }}>
      <motion.div
        initial={isNew && !reduce ? { opacity: 0, y: 8, scale: 0.96 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 520, damping: 32 }}
        style={{ transformOrigin: mine ? '100% 100%' : '0% 100%' }}
      >
        <Box
          sx={(t) => ({
            px: 1.75, py: 0.9, wordBreak: 'break-word', whiteSpace: 'pre-wrap', color: t.palette.text.primary,
            borderRadius: mine ? `${round}px ${top}px ${bottom}px ${round}px` : `${top}px ${round}px ${round}px ${bottom}px`,
            bgcolor: mine ? alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.32 : 0.15) : t.palette.background.paper,
            border: mine ? '1px solid transparent' : `1px solid ${t.palette.divider}`,
          })}
        >
          <Box sx={{ display: 'flow-root' }}>
            <Typography component="span" sx={{ fontSize: 14, lineHeight: 1.5 }}>{m.text}</Typography>
            <Box component="span" sx={{ float: 'right', ml: 1.5, mt: 1, display: 'inline-flex', alignItems: 'center', gap: 0.4, color: 'text.secondary', fontSize: 10.5, lineHeight: 1 }}>
              {clock(m.createdAt)}
              {mine && (m.readAt ? <DoneAllRoundedIcon sx={{ fontSize: 15, color: 'primary.main' }} aria-label="Seen" /> : <DoneRoundedIcon sx={{ fontSize: 15 }} aria-label="Sent" />)}
            </Box>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}

// `actions`: extra header icons. No `onClose` = no close button (always-open desktop panel).
// `overlay`: node shown instead of the messages + composer (e.g. the friend's profile) while the chat stays live underneath.
export function ChatPanel({ friend, onClose, onCodeTogether, actions, overlay }) {
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
  const [away, setAway] = useState(false); // scrolled up: show the "jump to latest" button
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const scroller = useRef(null);
  const stick = useRef(true); // keep the view pinned to the newest message unless the user scrolled up
  const typingTimer = useRef(null);
  const lastTypingSent = useRef(0);
  const openedAt = useRef(Date.now()); // messages newer than this arrived while the chat was open (they animate in)

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

  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, typing, loading]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setAway((cur) => (cur === !stick.current ? cur : !stick.current));
  };

  const jump = () => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
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
      dispatch(setLast({ id: friend.userId, m: { from: message.from, kind: message.kind, text: message.text, at: message.createdAt } }));
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
        spacing={1.5}
        sx={(t) => ({ alignItems: 'center', height: 68, px: 2, flexShrink: 0, bgcolor: wsSurface(t).chrome, borderBottom: `1px solid ${t.palette.divider}` })}
      >
        <PersonAvatar person={friend} size={42} online={online} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{friend.name}</Typography>
          <Typography noWrap sx={{ fontSize: 12.5, mt: 0.1, color: typing || status.live ? 'success.main' : 'text.secondary', fontWeight: typing || status.live ? 600 : 400 }}>
            {typing ? <>typing<TypingDots /></> : status.text}
          </Typography>
        </Box>
        <WsIconButton title="Code together" onClick={onCodeTogether}><LaptopMacRoundedIcon /></WsIconButton>
        {actions}
        {onClose && <WsIconButton title="Close chat" onClick={onClose}><CloseRoundedIcon /></WsIconButton>}
      </Stack>

      {overlay}

      {/* messages on a plain, flat background */}
      <Box sx={{ position: 'relative', flex: 1, minHeight: 0, display: overlay ? 'none' : 'flex', flexDirection: 'column' }}>
        <Box
          ref={scroller}
          data-chat-scroll
          onScroll={onScroll}
          sx={(t) => ({
            flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', px: { xs: 2, sm: 3 }, py: 2, display: 'flex', flexDirection: 'column', gap: '2px', scrollbarWidth: 'thin',
            bgcolor: wsSurface(t).panel,
          })}
        >
          {loading && <Box sx={{ m: 'auto' }}><CircularProgress size={24} /></Box>}
          {!loading && error && <Typography color="error" variant="body2" sx={{ m: 'auto', textAlign: 'center' }}>{error}</Typography>}
          {!loading && hasMore && (
            <Button size="small" onClick={loadOlder} disabled={loadingMore} sx={(t) => ({ ...pill(t), textTransform: 'none', mb: 0.5 })}>
              {loadingMore ? 'Loading…' : 'Load earlier messages'}
            </Button>
          )}
          {!loading && !error && messages.length === 0 && (
            <Stack spacing={0.5} sx={{ alignItems: 'center', m: 'auto', textAlign: 'center', color: 'text.secondary', px: 3 }}>
              <PulseArt icon={<ChatBubbleOutlineRoundedIcon />} />
              <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: 'text.primary', pt: 0.5 }}>Say hi to {friend.name.split(' ')[0]}</Typography>
              <Typography sx={{ fontSize: 13, maxWidth: 260, lineHeight: 1.5 }}>No messages yet. Send a message, or start a coding room together.</Typography>
            </Stack>
          )}
          {messages.map((m, i) => {
            const mine = m.from === myId;
            const day = dayLabel(m.createdAt);
            const showDay = day !== lastDay;
            lastDay = day;
            const prev = messages[i - 1];
            const next = messages[i + 1];
            const first = showDay || !prev || prev.from !== m.from || prev.kind !== 'text' || m.kind !== 'text';
            const endsRun = !next || next.from !== m.from || next.kind !== 'text' || dayLabel(next.createdAt) !== day;
            const isNew = Date.parse(m.createdAt) > openedAt.current;
            return (
              <Box key={m.id} sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {showDay && <Box sx={(t) => ({ ...pill(t), my: 1.25 })}>{day}</Box>}
                {m.kind === 'nudge' ? <NudgeLine m={m} mine={mine} friend={friend} /> : m.kind === 'room' ? <RoomCard m={m} mine={mine} friend={friend} /> : <Bubble m={m} mine={mine} first={first} endsRun={endsRun} isNew={isNew} />}
              </Box>
            );
          })}
          {typing && (
            <Box
              role="status"
              aria-label={`${friend.name} is typing`}
              sx={(t) => ({ alignSelf: 'flex-start', mt: 1, px: 1.75, py: 1.1, borderRadius: '18px 18px 18px 6px', bgcolor: t.palette.background.paper, border: `1px solid ${t.palette.divider}`, color: 'text.secondary', '& > div': { ml: 0 } })}
            >
              <TypingDots />
            </Box>
          )}
        </Box>
        {away && (
          <IconButton
            aria-label="Jump to latest message"
            onClick={jump}
            sx={(t) => ({ position: 'absolute', right: 14, bottom: 12, width: 36, height: 36, bgcolor: t.palette.background.paper, boxShadow: '0 2px 6px rgba(0,0,0,0.25)', '&:hover': { bgcolor: t.palette.background.paper } })}
          >
            <KeyboardArrowDownRoundedIcon />
          </IconButton>
        )}
      </Box>

      {/* composer */}
      <Stack
        direction="row"
        spacing={1}
        sx={(t) => ({ alignItems: 'flex-end', display: overlay ? 'none' : 'flex', flexShrink: 0, px: 1.5, pt: 1.25, pb: 'calc(10px + env(safe-area-inset-bottom))', bgcolor: wsSurface(t).chrome, borderTop: `1px solid ${t.palette.divider}` })}
      >
        <WsIconButton title="Emoji" size="lg" onClick={(e) => setEmojiAnchor(e.currentTarget)}><EmojiEmotionsOutlinedIcon /></WsIconButton>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          size="small"
          placeholder="Type a message"
          value={text}
          onChange={onType}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
          sx={(t) => ({
            '& .MuiOutlinedInput-root': { borderRadius: '22px', py: 1, px: 2, bgcolor: wsSurface(t).raised, fontSize: 14.5, transition: 'box-shadow .18s' },
            '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: `0 0 0 2px ${alpha(t.palette.primary.main, 0.45)}` },
            '& fieldset': { border: 'none' },
          })}
          slotProps={{ htmlInput: { 'aria-label': `Message ${friend.name}`, maxLength: 1000 } }}
        />
        <IconButton
          aria-label="Send message"
          onClick={send}
          disabled={!text.trim() || sending}
          sx={(t) => ({
            width: 42, height: 42, flexShrink: 0, color: t.palette.primary.contrastText, bgcolor: 'primary.main', transition: 'transform .15s, background-color .15s',
            '&:hover': { bgcolor: 'primary.dark' }, '&:active': { transform: 'scale(0.9)' },
            '&.Mui-disabled': { color: 'text.disabled', bgcolor: t.palette.action.hover },
          })}
        >
          {sending ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon sx={{ fontSize: 19 }} />}
        </IconButton>
      </Stack>

      <Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 0.75, borderRadius: '12px' } } }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 34px)', gap: 0.25 }}>
          {EMOJIS.map((e) => (
            <IconButton key={e} aria-label={`Insert ${e}`} onClick={() => setText((v) => (v + e).slice(0, 1000))} sx={{ width: 34, height: 34, fontSize: 19, borderRadius: '8px' }}>{e}</IconButton>
          ))}
        </Box>
      </Popover>
    </Box>
  );
}

// Right-side drawer (full screen on phones) that hosts one friend's chat.
export default function FriendChat({ friend, onClose, onCodeTogether, actions, overlay }) {
  return (
    <Drawer
      anchor="right"
      open={Boolean(friend)}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 440 }, maxWidth: '100%', backgroundImage: 'none' } } }}
    >
      {friend && <ChatPanel key={friend.userId} friend={friend} onClose={onClose} onCodeTogether={() => onCodeTogether(friend)} actions={actions} overlay={overlay} />}
    </Drawer>
  );
}
