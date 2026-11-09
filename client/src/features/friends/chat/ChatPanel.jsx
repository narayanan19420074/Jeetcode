import { Box, Button, ButtonBase, CircularProgress, IconButton, Popover, Stack, TextField, Typography, alpha } from '@mui/material';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, MOTION, RADII, RADII_PX, SHADOWS, withAlpha } from '../../../app/design/designTokens';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { LIB_ACCENT, LIB_TRACKING, libChipSx } from '../../dashboard/components/libraryStyle';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import { PersonAvatar, dayLabel, statusInfo } from '../friendsUi';
import { PulseArt } from '../friendsKit';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { WsIconButton } from '../../workspace/wsUi';
import { clearUnread, setActiveChat, setLast } from '../friendsSlice';
import { extractErrorMessage } from '../../../api/apiClient';
import { friendsApi } from '../../../api/friendsApi';
import { getFriendsSocket } from '../friendsRealtime';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { wsSurface } from '../../workspace/workspaceTheme';
import { EMOJIS, addUnique, libDayPill, pill } from './chatShared';
import { Bubble, LibBubble, LibNudgeLine, LibRoomCard, NudgeLine, RoomCard, TypingDots } from './ChatBubbles';
import { LibHeader } from './LibHeader';

// `actions`: extra header icons. No `onClose` = no close button (always-open desktop panel).
// `overlay`: node shown instead of the messages + composer (e.g. the friend's profile) while the chat stays live underneath.
// `lib` = phone Library look (must render inside LibraryFont). Then the header shows back / profile / code together / menu,
// driven by `profileOpen`, `onToggleProfile`, `onNudge` (omit when a nudge makes no sense), `nudging` and `onRemove`.
export function ChatPanel({ friend, onClose, onCodeTogether, actions, overlay, lib = false, profileOpen = false, onToggleProfile, onNudge, nudging = false, onRemove }) {
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
      {lib ? (
        <LibHeader
          friend={friend}
          online={online}
          typing={typing}
          status={status}
          profileOpen={profileOpen}
          onBack={profileOpen ? onToggleProfile : onClose}
          onToggleProfile={onToggleProfile}
          onCodeTogether={onCodeTogether}
          onNudge={onNudge}
          nudging={nudging}
          onRemove={onRemove}
        />
      ) : (
      <Stack
        direction="row"
        spacing={1.5}
        sx={(t) => ({ alignItems: 'center', height: 68, px: 2, flexShrink: 0, bgcolor: wsSurface(t).chrome, borderBottom: `1px solid ${t.palette.divider}` })}
      >
        <PersonAvatar person={friend} size={42} online={online} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg, lineHeight: 1.3 }}>{friend.name}</Typography>
          <Typography noWrap sx={{ fontSize: FONT_SIZES.caption, mt: 0.5, color: typing || status.live ? 'success.main' : 'text.secondary', fontWeight: typing || status.live ? FONT_WEIGHTS.semibold : FONT_WEIGHTS.regular }}>
            {typing ? <>typing<TypingDots /></> : status.text}
          </Typography>
        </Box>
        <WsIconButton title="Code together" onClick={onCodeTogether}><LaptopMacRoundedIcon /></WsIconButton>
        {actions}
        {onClose && <WsIconButton title="Close chat" onClick={onClose}><CloseRoundedIcon /></WsIconButton>}
      </Stack>
      )}

      {overlay}

      {/* messages on a plain, flat background */}
      <Box sx={{ position: 'relative', flex: 1, minHeight: 0, display: overlay ? 'none' : 'flex', flexDirection: 'column' }}>
        <Box
          ref={scroller}
          data-chat-scroll
          onScroll={onScroll}
          sx={(t) => ({
            flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', px: { xs: 2, sm: 3 }, py: 2, display: 'flex', flexDirection: 'column', gap: 0.5, scrollbarWidth: 'thin',
            bgcolor: lib ? 'var(--lib-bg)' : wsSurface(t).panel,
          })}
        >
          {loading && <Box sx={{ m: 'auto' }}><CircularProgress size={24} /></Box>}
          {!loading && error && <Typography color="error" variant="body2" sx={{ m: 'auto', textAlign: 'center' }}>{error}</Typography>}
          {!loading && hasMore && (
            lib ? (
              <ButtonBase onClick={loadOlder} disabled={loadingMore} sx={{ ...libChipSx(false), alignSelf: 'center', mb: 0.5 }}>
                {loadingMore ? 'Loading…' : 'Load earlier messages'}
              </ButtonBase>
            ) : (
              <Button size="small" onClick={loadOlder} disabled={loadingMore} sx={(t) => ({ ...pill(t), textTransform: 'none', mb: 0.5 })}>
                {loadingMore ? 'Loading…' : 'Load earlier messages'}
              </Button>
            )
          )}
          {!loading && !error && messages.length === 0 && lib && (
            <Box sx={{ m: 'auto', textAlign: 'center', px: 2 }}>
              <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.subheading, lineHeight: '24px' }}>Say hi to {friend.name.split(' ')[0]}</Typography>
              <Typography sx={{ mt: 0.5, fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>No messages yet. Send a message, or start a coding room together.</Typography>
            </Box>
          )}
          {!loading && !error && messages.length === 0 && !lib && (
            <Stack spacing={0.5} sx={{ alignItems: 'center', m: 'auto', textAlign: 'center', color: 'text.secondary', px: 3 }}>
              <PulseArt icon={<ChatBubbleOutlineRoundedIcon />} />
              <Typography sx={{ fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.bold, color: 'text.primary', pt: 0.5 }}>Say hi to {friend.name.split(' ')[0]}</Typography>
              <Typography sx={{ fontSize: FONT_SIZES.body, maxWidth: 260, lineHeight: 1.5 }}>No messages yet. Send a message, or start a coding room together.</Typography>
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
              <Box key={m.id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {showDay && (lib ? <Box sx={{ ...libDayPill, my: 1.5 }}>{day}</Box> : <Box sx={(t) => ({ ...pill(t), my: 1.5 })}>{day}</Box>)}
                {lib ? (
                  m.kind === 'nudge' ? <LibNudgeLine m={m} mine={mine} friend={friend} /> : m.kind === 'room' ? <LibRoomCard m={m} mine={mine} friend={friend} /> : <LibBubble m={m} mine={mine} first={first} endsRun={endsRun} isNew={isNew} />
                ) : m.kind === 'nudge' ? <NudgeLine m={m} mine={mine} friend={friend} /> : m.kind === 'room' ? <RoomCard m={m} mine={mine} friend={friend} /> : <Bubble m={m} mine={mine} first={first} endsRun={endsRun} isNew={isNew} />}
              </Box>
            );
          })}
          {typing && (
            <Box
              role="status"
              aria-label={`${friend.name} is typing`}
              sx={(t) => (lib
                ? { alignSelf: 'flex-start', mt: 1, px: 2, py: 1.5, borderRadius: `${RADII.card}px ${RADII.card}px ${RADII.card}px ${RADII.control}px`, bgcolor: 'var(--lib-player)', color: 'var(--lib-muted)' }
                : { alignSelf: 'flex-start', mt: 1, px: 2, py: 1, borderRadius: `${RADII.card}px ${RADII.card}px ${RADII.card}px ${RADII.control}px`, bgcolor: t.palette.background.paper, border: `1px solid ${t.palette.divider}`, color: 'text.secondary', '& > div': { ml: 0 } })}
            >
              <TypingDots />
            </Box>
          )}
        </Box>
        {away && (
          <IconButton
            aria-label="Jump to latest message"
            onClick={jump}
            sx={(t) => (lib
              ? { position: 'absolute', right: 16, bottom: 12, width: 40, height: 40, bgcolor: 'var(--lib-player)', color: 'var(--lib-text)', border: '1px solid var(--lib-border)', '&:hover': { bgcolor: 'var(--lib-player)' } }
              : { position: 'absolute', right: 14, bottom: 12, width: 36, height: 36, bgcolor: t.palette.background.paper, boxShadow: SHADOWS.drop('xs', withAlpha(COLOR_PALETTE.black, 0.25)), '&:hover': { bgcolor: t.palette.background.paper } })}
          >
            <KeyboardArrowDownRoundedIcon />
          </IconButton>
        )}
      </Box>

      {/* composer */}
      {lib ? (
        <Stack direction="row" sx={{ alignItems: 'flex-end', gap: 1, display: overlay ? 'none' : 'flex', flexShrink: 0, px: 2, pt: 1, pb: 'calc(8px + env(safe-area-inset-bottom))', bgcolor: 'var(--lib-bg)' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            size="small"
            placeholder="Message"
            value={text}
            onChange={onType}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: RADII_PX.card, minHeight: 44, py: 1, px: 2, bgcolor: 'var(--lib-player)', fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: 'var(--lib-text)' },
              '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: SHADOWS.ring(LIB_ACCENT) },
              '& .MuiInputBase-input': { p: 0 },
              '& fieldset': { border: 'none' },
            }}
            slotProps={{ htmlInput: { 'aria-label': `Message ${friend.name}`, maxLength: 1000 } }}
          />
          <IconButton
            aria-label="Send message"
            onClick={send}
            disabled={!text.trim() || sending}
            sx={{ width: 44, height: 44, flexShrink: 0, color: COLOR_PALETTE.white, bgcolor: LIB_ACCENT, '&:hover': { bgcolor: `color-mix(in srgb, ${LIB_ACCENT} 85%, ${COLOR_PALETTE.black})` }, '&.Mui-disabled': { color: 'var(--lib-muted)', bgcolor: 'var(--lib-chip)' } }}
          >
            {sending ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} />}
          </IconButton>
        </Stack>
      ) : (
      <Stack
        direction="row"
        spacing={1}
        sx={(t) => ({ alignItems: 'flex-end', display: overlay ? 'none' : 'flex', flexShrink: 0, px: 1.5, pt: 1.5, pb: 'calc(10px + env(safe-area-inset-bottom))', bgcolor: wsSurface(t).chrome, borderTop: `1px solid ${t.palette.divider}` })}
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
            '& .MuiOutlinedInput-root': { borderRadius: RADII_PX.card, py: 1, px: 2, bgcolor: wsSurface(t).raised, fontSize: FONT_SIZES.bodyLg, transition: `box-shadow ${MOTION.standard}ms` },
            '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: SHADOWS.ring(alpha(t.palette.primary.main, 0.45)) },
            '& fieldset': { border: 'none' },
          })}
          slotProps={{ htmlInput: { 'aria-label': `Message ${friend.name}`, maxLength: 1000 } }}
        />
        <IconButton
          aria-label="Send message"
          onClick={send}
          disabled={!text.trim() || sending}
          sx={(t) => ({
            width: 42, height: 42, flexShrink: 0, color: t.palette.primary.contrastText, bgcolor: 'primary.main', transition: `transform ${MOTION.fast}ms, background-color ${MOTION.fast}ms`,
            '&:hover': { bgcolor: 'primary.dark' }, '&:active': { transform: 'scale(0.9)' },
            '&.Mui-disabled': { color: 'text.disabled', bgcolor: t.palette.action.hover },
          })}
        >
          {sending ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} />}
        </IconButton>
      </Stack>
      )}

      {!lib && (
      <Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 1, borderRadius: RADII_PX.card } } }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 34px)', gap: 0.5 }}>
          {EMOJIS.map((e) => (
            <IconButton key={e} aria-label={`Insert ${e}`} onClick={() => setText((v) => (v + e).slice(0, 1000))} sx={{ width: 34, height: 34, fontSize: FONT_SIZES.heading, borderRadius: RADII_PX.control }}>{e}</IconButton>
          ))}
        </Box>
      </Popover>
      )}
    </Box>
  );
}
