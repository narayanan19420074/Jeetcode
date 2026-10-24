import { lazy, Suspense, useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Avatar, Box, Button, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { inr } from './contestUtils';

// three.js is heavy, so it only downloads when a finished contest actually has winners to show.
const PodiumScene = lazy(() => import('./PodiumScene'));

const EMPTY = [];
const INK = '#1E1B4B';
const SOFT = '#EEF1FB';
// Neumorphic: raised = light top-left / soft shadow bottom-right. Fixed light colours on purpose (this panel is always light).
const RAISED_SM = '5px 5px 12px rgba(148,163,184,0.4), -5px -5px 12px rgba(255,255,255,0.95)';
const PRESSED = 'inset 4px 4px 9px rgba(148,163,184,0.4), inset -4px -4px 9px rgba(255,255,255,0.95)';

const FRAMES = [
  'linear-gradient(135deg,#FF9A3C,#FF3D81,#7C4DFF)',
  'linear-gradient(135deg,#22D3EE,#6366F1,#A855F7)',
  'linear-gradient(135deg,#34D399,#22D3EE,#3B82F6)',
  'linear-gradient(135deg,#F472B6,#FB923C,#FACC15)',
  'linear-gradient(135deg,#60A5FA,#34D399,#A3E635)',
];
const BADGES = ['#F59E0B', '#6366F1', '#F97316', '#EC4899', '#14B8A6', '#3B82F6', '#8B5CF6'];
const badgeBg = (rank) => {
  const c = BADGES[(rank - 1) % BADGES.length];
  return `linear-gradient(135deg, ${c}, color-mix(in srgb, ${c} 60%, #7C4DFF))`;
};

const nudge = keyframes`0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); }`;

function AvatarFrame({ row, size = 46, index }) {
  return (
    <Box sx={{ p: '3px', borderRadius: '50%', flexShrink: 0, background: FRAMES[index % FRAMES.length], boxShadow: '0 6px 14px -6px rgba(99,102,241,0.55)' }}>
      <Box sx={{ p: '2px', borderRadius: '50%', bgcolor: '#F8FAFF' }}>
        <Avatar src={row.avatarUrl || undefined} alt={row.name} sx={{ width: size, height: size, fontWeight: 800, fontSize: size * 0.4, color: '#4338CA', bgcolor: '#E0E7FF' }}>
          {row.name?.[0]?.toUpperCase()}
        </Avatar>
      </Box>
    </Box>
  );
}

function Chip({ bg, fg, children }) {
  return <Box sx={{ px: 1.1, py: 0.35, borderRadius: 99, fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', bgcolor: bg, color: fg }}>{children}</Box>;
}

function WinnerRow({ row, index, delay, reduce }) {
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: reduce ? 0 : delay }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, px: { xs: 1.75, sm: 2.5 }, py: { xs: 1.5, sm: 1.75 }, borderRadius: '20px', bgcolor: SOFT, boxShadow: RAISED_SM }}>
        <Box sx={{ width: 36, height: 36, flexShrink: 0, borderRadius: '12px', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900, fontSize: 14, background: badgeBg(row.rank), boxShadow: '0 6px 12px -6px rgba(99,102,241,0.7)' }}>{row.rank}</Box>
        <AvatarFrame row={row} index={index} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: 800, fontSize: 15, color: INK }}>{row.name}</Typography>
          <Typography noWrap sx={{ fontSize: 12.5, color: '#64748B' }}>@{row.handle}</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.6, flexShrink: 0 }}>
          {row.prize ? <Chip bg="#FEF3C7" fg="#B45309">{inr(row.prize)}</Chip> : null}
          <Chip bg="#D1FAE5" fg="#047857">{row.solved ?? 0} solved</Chip>
        </Box>
      </Box>
    </motion.div>
  );
}

// Contest top 10: 3D glass podium for ranks 1-3 and a list for 4-10. `revealed` flips when the person taps a past
// contest card (or the Reveal button), which starts the fireworks + rise animation.
export default function WinnersPanel({ contest, revealed, runKey, onReveal, onReplay }) {
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const onFail = useCallback(() => setFailed(true), []);
  const winners = contest.winners || EMPTY;
  const has = winners.length > 0;
  const rows = failed ? winners : winners.slice(3);

  return (
    <Box
      sx={{
        position: 'relative', overflow: 'hidden', borderRadius: '28px', p: { xs: 2.5, sm: 4 },
        background: 'linear-gradient(160deg,#F5F3FF 0%,#EEF2FF 50%,#FDF2F8 100%)', border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 24px 50px -30px rgba(76,29,149,0.4)',
      }}
    >
      <Box aria-hidden sx={{ position: 'absolute', top: -70, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,114,182,0.35), transparent 70%)', pointerEvents: 'none' }} />
      <Box aria-hidden sx={{ position: 'absolute', bottom: -80, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.28), transparent 70%)', pointerEvents: 'none' }} />

      <Box sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, minWidth: 0 }}>
            <Box sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: '16px', display: 'grid', placeItems: 'center', bgcolor: SOFT, boxShadow: RAISED_SM, color: '#F59E0B' }}>
              <EmojiEventsRoundedIcon />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: 20, sm: 23 }, color: INK, letterSpacing: '-0.01em', lineHeight: 1.2 }}>Contest top 10</Typography>
              <Typography noWrap sx={{ fontSize: 13, color: '#64748B', mt: 0.3 }}>{contest.title}</Typography>
            </Box>
          </Box>
          {has && revealed && !failed && (
            <Tooltip title="Replay reveal">
              <IconButton aria-label="Replay reveal" onClick={onReplay} sx={{ bgcolor: SOFT, boxShadow: RAISED_SM, color: '#6366F1', '&:hover': { bgcolor: SOFT, boxShadow: PRESSED } }}>
                <ReplayRoundedIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {!has && (
          <Box sx={{ mt: 3, py: 6, px: 3, textAlign: 'center', borderRadius: '24px', bgcolor: SOFT, boxShadow: PRESSED }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 46, color: '#F59E0B' }} />
            <Typography sx={{ fontWeight: 800, mt: 0.5, color: INK }}>Results coming soon</Typography>
            <Typography sx={{ fontSize: 13.5, color: '#64748B', mt: 0.5 }}>Winners appear here once the organizers verify the rankings.</Typography>
          </Box>
        )}

        {has && !failed && (
          <Box
            sx={{
              position: 'relative', mt: 3, overflow: 'hidden', borderRadius: '24px', height: { xs: 380, sm: 460 },
              bgcolor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.95)', boxShadow: `${PRESSED}, 0 18px 40px -28px rgba(99,102,241,0.5)`,
            }}
          >
            <Suspense fallback={<Skeleton variant="rounded" sx={{ position: 'absolute', inset: 16, height: 'auto', borderRadius: '18px' }} />}>
              <PodiumScene key={`${contest.id}-${runKey}`} winners={winners} revealed={revealed} reduce={Boolean(reduce)} onFail={onFail} />
            </Suspense>
            {!revealed && (
              <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: { xs: 20, sm: 28 }, display: 'grid', placeItems: 'center', gap: 1, pointerEvents: 'none' }}>
                <Button
                  onClick={onReveal} disableElevation startIcon={<BoltRoundedIcon />}
                  sx={{ pointerEvents: 'auto', px: 3.5, height: 48, borderRadius: '16px', color: '#fff', fontWeight: 800, background: 'linear-gradient(135deg,#FF9A3C,#FF3D81,#7C4DFF)', boxShadow: '0 14px 28px -12px rgba(124,77,255,0.8)', animation: `${nudge} 2s ease-in-out infinite`, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}
                >
                  Reveal winners
                </Button>
                <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>Or tap the contest in the Past tab</Typography>
              </Box>
            )}
          </Box>
        )}

        {has && revealed && rows.length > 0 && (
          <Box sx={{ display: 'grid', gap: 1.75, mt: 3 }}>
            {rows.map((r, i) => <WinnerRow key={r.rank} row={r} index={i} delay={failed ? 0.1 + i * 0.07 : 2.3 + i * 0.09} reduce={reduce} />)}
          </Box>
        )}
      </Box>
    </Box>
  );
}
