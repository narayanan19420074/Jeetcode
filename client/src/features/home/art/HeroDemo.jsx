import { useEffect, useState } from 'react';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MONO_FONT, blink, pulseDot, typeLine } from '../anim';

// The hero's live product window. Three real moments from the app:
// solving against test cases, answering a timed aptitude question, and
// pairing in a room. Visitors can click the tabs and the answer options;
// it auto-plays until the first touch. Everything in here is labelled as a
// sample, nothing is a real user's data.

const TABS = [
  { id: 'solve', label: 'Solve', Icon: CodeRoundedIcon },
  { id: 'time', label: 'Time it', Icon: TimerRoundedIcon },
  { id: 'pair', label: 'Pair up', Icon: GroupsRoundedIcon },
];
const AUTO_MS = 9000;

function useSyntax() {
  const t = useTheme();
  return {
    kw: t.palette.primary.main,
    fn: t.palette.text.primary,
    tx: t.palette.text.secondary,
    st: t.palette.success.main,
  };
}

const CODE = [
  [['def ', 'kw'], ['two_sum', 'fn'], ['(nums, target):', 'tx']],
  [['    seen = {}', 'tx']],
  [['    for ', 'kw'], ['i, n ', 'tx'], ['in ', 'kw'], ['enumerate', 'fn'], ['(nums):', 'tx']],
  [['        if ', 'kw'], ['target - n ', 'tx'], ['in ', 'kw'], ['seen:', 'tx']],
  [['            return ', 'kw'], ['[seen[target - n], i]', 'tx']],
  [['        seen[n] = i', 'tx']],
];

function CodeBlock({ animate: play = true, startDelay = 0 }) {
  const c = useSyntax();
  return (
    <Box sx={{ fontFamily: MONO_FONT, fontSize: { xs: '0.7rem', sm: '0.78rem' }, lineHeight: 1.75 }}>
      {CODE.map((line, i) => (
        <Box
          key={i}
          sx={{
            whiteSpace: 'pre',
            animation: play ? `${typeLine} 0.5s steps(24, end) ${startDelay + i * 0.38}s both` : 'none',
          }}
        >
          {line.map(([txt, kind], j) => (
            <Box key={j} component="span" sx={{ color: c[kind], fontWeight: kind === 'kw' ? 600 : 400 }}>
              {txt}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

// ---- 1. Solve: code, then test cases tick over, then the verdict lands.
function SolvePanel() {
  const t = useTheme();
  const rows = [
    ['[2, 7, 11, 15], target 9', '[0, 1]'],
    ['[3, 2, 4], target 6', '[1, 2]'],
    ['[3, 3], target 6', '[0, 1]'],
  ];
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Two Sum</Typography>
        <Box sx={{ px: 1, py: 0.1, borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, color: 'success.main', bgcolor: alpha(t.palette.success.main, 0.14) }}>
          Easy
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          Python
        </Typography>
      </Stack>
      <CodeBlock startDelay={0.1} />
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }}>
        <Stack spacing={0.8}>
          {rows.map(([input, out], i) => (
            <motion.div
              key={input}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2.7 + i * 0.4, duration: 0.3 }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography noWrap sx={{ fontFamily: MONO_FONT, fontSize: '0.7rem', color: 'text.secondary', flex: 1 }}>
                  {input} returns {out}
                </Typography>
              </Stack>
            </motion.div>
          ))}
        </Stack>
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 4.1, type: 'spring', stiffness: 260, damping: 14 }}
          style={{ transformOrigin: 'left center' }}
        >
          <Box
            sx={{
              mt: 1.5,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: 99,
              fontWeight: 800,
              fontSize: '0.82rem',
              color: 'success.main',
              bgcolor: alpha(t.palette.success.main, 0.14),
            }}
          >
            Accepted: 3 of 3 test cases passed
          </Box>
        </motion.div>
      </Box>
    </Stack>
  );
}

// ---- 2. Time it: a real, clickable aptitude question with a ticking timer.
const OPTIONS = ['45 km/h', '54 km/h', '60 km/h', '72 km/h'];
const CORRECT = 1;

function TimePanel({ onInteract }) {
  const t = useTheme();
  const [picked, setPicked] = useState(null);
  const [left, setLeft] = useState(120);

  useEffect(() => {
    if (picked !== null) return undefined;
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [picked]);

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const done = picked !== null;

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Time and Distance</Typography>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: left < 20 ? 'error.main' : 'text.secondary' }}>
          <TimerRoundedIcon sx={{ fontSize: 17 }} />
          <Typography sx={{ fontFamily: MONO_FONT, fontWeight: 600, fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' }}>
            {mm}:{ss}
          </Typography>
        </Stack>
      </Stack>
      <Typography sx={{ fontWeight: 600, lineHeight: 1.5 }}>
        A train 150 m long passes a pole in 10 seconds. What is its speed?
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        {OPTIONS.map((o, i) => {
          const isRight = done && i === CORRECT;
          const isWrong = done && picked === i && i !== CORRECT;
          return (
            <ButtonBase
              key={o}
              disabled={done}
              onClick={() => {
                setPicked(i);
                onInteract();
              }}
              sx={{
                justifyContent: 'flex-start',
                gap: 1,
                px: 1.5,
                py: 1.1,
                borderRadius: '10px',
                border: '1.5px solid',
                borderColor: isRight ? 'success.main' : isWrong ? 'error.main' : 'divider',
                bgcolor: isRight ? alpha(t.palette.success.main, 0.12) : isWrong ? alpha(t.palette.error.main, 0.1) : 'transparent',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: 'text.primary',
                transition: 'border-color .15s, background-color .15s',
                '&:hover': { borderColor: done ? undefined : 'primary.main' },
                '&.Mui-disabled': { color: 'text.primary' },
              }}
            >
              <Box component="span" sx={{ width: 20, color: 'text.secondary', fontWeight: 700 }}>
                {'ABCD'[i]}
              </Box>
              {o}
              {isRight && <CheckCircleRoundedIcon sx={{ ml: 'auto', fontSize: 18, color: 'success.main' }} />}
              {isWrong && <CancelRoundedIcon sx={{ ml: 'auto', fontSize: 18, color: 'error.main' }} />}
            </ButtonBase>
          );
        })}
      </Box>
      <Box sx={{ minHeight: 44 }} aria-live="polite">
        {done ? (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {picked === CORRECT ? 'Right. ' : 'Not quite. '}
              150 m in 10 s is 15 m/s, and 15 × 18/5 = 54 km/h.
            </Typography>
          </motion.div>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Tap an option. Real tests run on a timer like this one.
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

// ---- 3. Pair up: two people, one editor, live chat.
const CHAT = [
  { who: 'A', text: 'Hash map should get this to O(n)', delay: 0.5 },
  { who: 'K', text: 'Agreed. Typing it in now', delay: 1.9 },
  { who: 'A', text: 'Run it?', delay: 3.4 },
  { who: 'K', text: 'All 3 passed', delay: 4.6 },
];

function PairPanel() {
  const t = useTheme();
  const me = t.palette.primary.main;
  const other = t.palette.warning.main;
  const c = useSyntax();
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', '--pulse': alpha(t.palette.success.main, 0.5), animation: `${pulseDot} 2s infinite` }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Room is live</Typography>
        </Stack>
        <Stack direction="row" spacing={0.75}>
          {[MicRoundedIcon, VideocamRoundedIcon].map((I, i) => (
            <Box key={i} sx={{ width: 28, height: 28, borderRadius: '8px', display: 'grid', placeItems: 'center', bgcolor: alpha(t.palette.text.secondary, 0.12) }}>
              <I sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Box>
          ))}
          <Box sx={{ px: 1.1, height: 28, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 0.4, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700, fontSize: '0.75rem' }}>
            <PlayArrowRoundedIcon sx={{ fontSize: 16 }} /> Run
          </Box>
        </Stack>
      </Stack>

      <Box sx={{ position: 'relative', fontFamily: MONO_FONT, fontSize: { xs: '0.7rem', sm: '0.76rem' }, lineHeight: 1.8, p: 1.5, borderRadius: '10px', bgcolor: alpha(t.palette.text.secondary, 0.07) }}>
        <Box sx={{ whiteSpace: 'pre', color: c.tx }}>
          <Box component="span" sx={{ color: c.kw, fontWeight: 600 }}>def </Box>
          <Box component="span" sx={{ color: c.fn }}>two_sum</Box>(nums, target):
        </Box>
        <Box sx={{ whiteSpace: 'pre', color: c.tx }}>
          {'    seen = {}'}
          <Cursor color={other} label="Karthik" />
        </Box>
        <Box sx={{ whiteSpace: 'pre', color: c.tx }}>
          <Box component="span" sx={{ color: c.kw, fontWeight: 600 }}>{'    for '}</Box>i, n{' '}
          <Box component="span" sx={{ color: c.kw, fontWeight: 600 }}>in </Box>
          <Box component="span" sx={{ color: c.fn }}>enumerate</Box>(nums):
          <Cursor color={me} label="Asha" />
        </Box>
      </Box>

      <Stack spacing={0.9} sx={{ minHeight: 138 }}>
        {CHAT.map((m) => {
          const mine = m.who === 'A';
          return (
            <motion.div
              key={m.text}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: m.delay, type: 'spring', stiffness: 260, damping: 22 }}
              style={{ alignSelf: mine ? 'flex-start' : 'flex-end', maxWidth: '82%' }}
            >
              <Box
                sx={{
                  px: 1.4,
                  py: 0.7,
                  borderRadius: mine ? '12px 12px 12px 3px' : '12px 12px 3px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  bgcolor: mine ? alpha(me, 0.14) : alpha(other, 0.16),
                }}
              >
                {m.text}
              </Box>
            </motion.div>
          );
        })}
      </Stack>
    </Stack>
  );
}

function Cursor({ color, label }) {
  return (
    <Box component="span" sx={{ position: 'relative', display: 'inline-block', width: 2, height: '1.1em', bgcolor: color, ml: '2px', verticalAlign: 'text-bottom', animation: `${blink} 1.1s steps(1) infinite` }}>
      <Box component="span" sx={{ position: 'absolute', bottom: '100%', left: 0, px: 0.6, borderRadius: '4px 4px 4px 0', bgcolor: color, color: '#fff', fontFamily: 'Geist, system-ui, sans-serif', fontSize: '0.6rem', fontWeight: 700, lineHeight: 1.5, whiteSpace: 'nowrap' }}>
        {label}
      </Box>
    </Box>
  );
}

export default function HeroDemo() {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState('solve');
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || reduce) return undefined;
    const id = setTimeout(() => setTab((cur) => TABS[(TABS.findIndex((x) => x.id === cur) + 1) % TABS.length].id), AUTO_MS);
    return () => clearTimeout(id);
  }, [tab, auto, reduce]);

  const stop = () => setAuto(false);

  return (
    <Box
      onPointerDown={stop}
      onFocusCapture={stop}
      sx={{
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        boxShadow: (t) => `0 30px 60px -30px ${alpha(t.palette.primary.main, 0.45)}, 0 2px 0 ${alpha(t.palette.common.white, t.palette.mode === 'dark' ? 0.04 : 0)} inset`,
      }}
    >
      <Stack direction="row" role="tablist" aria-label="Product preview" sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 1, pt: 1 }}>
        {TABS.map(({ id, label, Icon }) => {
          const on = tab === id;
          return (
            <ButtonBase
              key={id}
              role="tab"
              aria-selected={on}
              onClick={() => setTab(id)}
              sx={{
                position: 'relative',
                gap: 0.75,
                px: 1.75,
                py: 1.1,
                fontWeight: 700,
                fontSize: '0.86rem',
                color: on ? 'text.primary' : 'text.secondary',
                borderRadius: '8px 8px 0 0',
                '&:hover': { color: 'text.primary' },
                '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 },
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
              {label}
              {on && (
                <Box
                  component={motion.span}
                  layoutId="hero-tab-underline"
                  sx={{ position: 'absolute', left: 8, right: 8, bottom: -1, height: 2, borderRadius: 2, bgcolor: 'primary.main' }}
                />
              )}
            </ButtonBase>
          );
        })}
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', alignSelf: 'center', pr: 1, display: { xs: 'none', sm: 'block' } }}>
          Sample session
        </Typography>
      </Stack>
      <Box role="tabpanel" sx={{ p: { xs: 2, sm: 2.5 }, minHeight: { xs: 372, sm: 392 } }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {tab === 'solve' && <SolvePanel />}
            {tab === 'time' && <TimePanel onInteract={stop} />}
            {tab === 'pair' && <PairPanel />}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
