import { Box, Button, Stack, Typography, alpha } from '@mui/material';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, withAlpha } from '../../../app/design/designTokens';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import { FLAME } from '../friendsUi';
import { LIB_ACCENT, LIB_TRACKING, libSmallBtnSx } from '../../dashboard/components/libraryStyle';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import { WS } from '../../workspace/wsTokens';
import { motion, useReducedMotion } from 'framer-motion';
import { roomApi } from '../../../api/roomApi';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { NUDGE_TONE, ROOM_TONE, clock, flatCard, toneBg } from './chatShared';

export function TypingDots() {
  return (
    <Box sx={{ display: 'inline-flex', gap: 0.5, ml: 0.5, verticalAlign: 'middle' }} aria-hidden>
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

export function NudgeLine({ m, mine, friend }) {
  return (
    <Box sx={(t) => ({ ...flatCard(t), alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 1.5, maxWidth: '88%', px: 2, py: 1, borderRadius: RADII_PX.card, textAlign: 'left', color: t.palette.text.secondary })}>
      <LocalFireDepartmentRoundedIcon sx={{ fontSize: FONT_SIZES.heading, color: FLAME, flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: 'text.primary', lineHeight: 1.35 }}>{mine ? `You nudged @${friend.handle}` : `@${friend.handle} nudged you`}</Typography>
        <Typography sx={{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.regular, lineHeight: 1.4 }}>{m.text}</Typography>
      </Box>
      <Typography sx={{ fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.regular, alignSelf: 'flex-end', flexShrink: 0 }}>{clock(m.createdAt)}</Typography>
    </Box>
  );
}

// "Code together" invite with a Join button (rooms are temporary, so we check before joining).
export function RoomCard({ m, mine, friend }) {
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
    <Box sx={(t) => ({ ...flatCard(t), alignSelf: mine ? 'flex-end' : 'flex-start', width: '100%', maxWidth: 320, p: 1.5, my: 0.5, borderRadius: RADII_PX.card, borderLeft: `3px solid ${t.palette.primary.main}` })}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box sx={(t) => ({ width: 40, height: 40, flexShrink: 0, borderRadius: RADII_PX.control, display: 'grid', placeItems: 'center', bgcolor: alpha(t.palette.primary.main, 0.14), color: t.palette.primary.main })}>
          <LaptopMacRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, lineHeight: 1.25 }}>Code together</Typography>
          <Typography noWrap sx={{ fontSize: FONT_SIZES.caption, color: 'text.secondary' }}>
            {mine ? `You invited @${friend.handle}` : `@${friend.handle} invited you`}{m.roomTitle ? ` · ${m.roomTitle}` : ''}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
        <Typography sx={{ fontSize: FONT_SIZES.micro, color: 'text.disabled' }}>{clock(m.createdAt)}</Typography>
        <Button size="small" variant="contained" disableElevation disabled={busy} onClick={join} sx={{ height: 30, borderRadius: `${WS.radius + 2}px`, fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.caption, textTransform: 'none', px: 2 }}>
          {busy ? 'Checking…' : mine ? 'Rejoin room' : 'Join room'}
        </Button>
      </Stack>
    </Box>
  );
}


// ---- Library look (phones) ----------------------------------------------------------------
// Same tokens as the phone dashboard: Roboto 16/24 text, cream surfaces, 16px gutter, 20px/16px radii,
// tinted category-card colours for system cards, solid accent for the person's own messages.

export function LibNudgeLine({ m, mine, friend }) {
  return (
    <Box sx={(t) => ({ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', maxWidth: 320, p: 1.5, my: 0.5, borderRadius: RADII_PX.card, border: '1.5px solid var(--lib-border)', bgcolor: toneBg(t, NUDGE_TONE), color: 'var(--lib-text)' })}>
      <LocalFireDepartmentRoundedIcon aria-hidden sx={{ fontSize: FONT_SIZES.displayLg, color: NUDGE_TONE.color, flexShrink: 0 }} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING, fontWeight: FONT_WEIGHTS.medium }}>{mine ? `You nudged @${friend.handle}` : `@${friend.handle} nudged you`}</Typography>
        <Typography sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>{m.text}</Typography>
      </Box>
      <Typography sx={{ fontSize: FONT_SIZES.caption, alignSelf: 'flex-end', flexShrink: 0, color: 'var(--lib-muted)' }}>{clock(m.createdAt)}</Typography>
    </Box>
  );
}

export function LibRoomCard({ m, mine, friend }) {
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
    <Box sx={(t) => ({ alignSelf: mine ? 'flex-end' : 'flex-start', width: '100%', maxWidth: 320, p: 1.5, my: 0.5, borderRadius: RADII_PX.card, border: '1.5px solid var(--lib-border)', bgcolor: toneBg(t, ROOM_TONE), color: 'var(--lib-text)' })}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
        <LaptopMacRoundedIcon aria-hidden sx={{ fontSize: FONT_SIZES.displayLg, color: ROOM_TONE.color, flexShrink: 0 }} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING, fontWeight: FONT_WEIGHTS.medium }}>Code together</Typography>
          <Typography noWrap sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>
            {mine ? `You invited @${friend.handle}` : `@${friend.handle} invited you`}
            {m.roomTitle ? ` · ${m.roomTitle}` : ''}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
        <Typography sx={{ fontSize: FONT_SIZES.caption, color: 'var(--lib-muted)' }}>{clock(m.createdAt)}</Typography>
        <Button disableElevation variant="contained" disabled={busy} onClick={join} sx={{ ...libSmallBtnSx, bgcolor: LIB_ACCENT, color: COLOR_PALETTE.white, '&:hover': { bgcolor: `color-mix(in srgb, ${LIB_ACCENT} 85%, ${COLOR_PALETTE.black})` } }}>
          {busy ? 'Checking…' : mine ? 'Rejoin room' : 'Join room'}
        </Button>
      </Stack>
    </Box>
  );
}

// Own messages: solid accent (like a selected pill). Friend's messages: cream (like the cards and chips).
export function LibBubble({ m, mine, first, endsRun, isNew }) {
  const reduce = useReducedMotion();
  const tight = 6;
  const round = 20;
  const top = first ? round : tight;
  const bottom = endsRun ? round : tight;
  return (
    <Box sx={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '84%', mt: first ? 1.5 : 0.5 }}>
      <motion.div
        initial={isNew && !reduce ? { opacity: 0, y: 8, scale: 0.96 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 520, damping: 32 }}
        style={{ transformOrigin: mine ? '100% 100%' : '0% 100%' }}
      >
        <Box
          sx={{
            px: 2, py: 1, wordBreak: 'break-word', whiteSpace: 'pre-wrap',
            borderRadius: mine ? `${round}px ${top}px ${bottom}px ${round}px` : `${top}px ${round}px ${round}px ${bottom}px`,
            bgcolor: mine ? LIB_ACCENT : 'var(--lib-player)',
            color: mine ? COLOR_PALETTE.white : 'var(--lib-text)',
          }}
        >
          <Box sx={{ display: 'flow-root' }}>
            <Typography component="span" sx={{ fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>{m.text}</Typography>
            <Box component="span" sx={{ float: 'right', ml: 1.5, mt: 1.5, display: 'inline-flex', alignItems: 'center', gap: 0.5, color: mine ? withAlpha(COLOR_PALETTE.white, 0.8) : 'var(--lib-muted)', fontSize: FONT_SIZES.caption, lineHeight: 1 }}>
              {clock(m.createdAt)}
              {mine && (m.readAt ? <DoneAllRoundedIcon sx={{ fontSize: FONT_SIZES.title, color: COLOR_PALETTE.white }} aria-label="Seen" /> : <DoneRoundedIcon sx={{ fontSize: FONT_SIZES.title }} aria-label="Sent" />)}
            </Box>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}

// Clean text bubble: flat colour, no tail, corners tighten inside a run of messages from the same person.
// `isNew` = arrived while the chat was open, so it pops in (history just appears).
export function Bubble({ m, mine, first, endsRun, isNew }) {
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
            px: 2, py: 1, wordBreak: 'break-word', whiteSpace: 'pre-wrap', color: t.palette.text.primary,
            borderRadius: mine ? `${round}px ${top}px ${bottom}px ${round}px` : `${top}px ${round}px ${round}px ${bottom}px`,
            bgcolor: mine ? alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.32 : 0.15) : t.palette.background.paper,
            border: mine ? '1px solid transparent' : `1px solid ${t.palette.divider}`,
          })}
        >
          <Box sx={{ display: 'flow-root' }}>
            <Typography component="span" sx={{ fontSize: FONT_SIZES.body, lineHeight: 1.5 }}>{m.text}</Typography>
            <Box component="span" sx={{ float: 'right', ml: 1.5, mt: 1, display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: FONT_SIZES.micro, lineHeight: 1 }}>
              {clock(m.createdAt)}
              {mine && (m.readAt ? <DoneAllRoundedIcon sx={{ fontSize: FONT_SIZES.bodyLg, color: 'primary.main' }} aria-label="Seen" /> : <DoneRoundedIcon sx={{ fontSize: FONT_SIZES.bodyLg }} aria-label="Sent" />)}
            </Box>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}
