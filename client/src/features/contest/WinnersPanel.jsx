import { lazy, Suspense, useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Avatar, Box, Button, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { inr } from './contestUtils';

// three.js is heavy, so it only downloads once the panel is on screen.
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

function AvatarFrame({ row, size = 34, index }) {
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
  return <Box sx={{ px: 1, py: 0.25, borderRadius: 99, fontSize: 11.5, fontWeight: 800, whiteSpace: 'nowrap', bgcolor: bg, color: fg }}>{children}</Box>;
}

// Rank 4-10 as small cards so the whole top 10 fits one screen.
function RankCard({ row, index, delay, reduce }) {
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: reduce ? 0 : delay }} style={{ minWidth: 0 }}>
      <Box sx={{ height: '100%', p: 1.4, borderRadius: '18px', bgcolor: SOFT, boxShadow: RAISED_SM, display: 'grid', gap: 0.9, alignContent: 'start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900, fontSize: 13, background: badgeBg(row.rank), boxShadow: '0 6px 12px -6px rgba(99,102,241,0.7)' }}>{row.rank}</Box>
          <AvatarFrame row={row} index={index} />
        </Box>
        <Typography noWrap sx={{ fontWeight: 800, fontSize: 13.5, color: INK }}>{row.name}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {row.prize ? <Chip bg="#FEF3C7" fg="#B45309">{inr(row.prize)}</Chip> : null}
          <Chip bg="#D1FAE5" fg="#047857">{row.solved ?? 0} solved</Chip>
        </Box>
      </Box>
    </motion.div>
  );
}

function LockedCard({ rank }) {
  return (
    <Box sx={{ height: '100%', minHeight: 96, borderRadius: '18px', bgcolor: SOFT, boxShadow: PRESSED, display: 'grid', placeItems: 'center', color: '#A5B4FC', fontWeight: 900, fontSize: 20 }}>#{rank}</Box>
  );
}

// Contest top 10: 3D glass podium for ranks 1-3 and small cards for 4-10. The podium is always on screen; with no
// finished contest (`contest` null) it stands empty. `revealed` flips when the person taps a past contest card
// (or the Reveal button), which starts the fireworks + rise animation. `fill` = stretch to the height its parent gives.
export default function WinnersPanel({ contest, revealed, runKey, onReveal, onReplay, fill = false }) {
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const onFail = useCallback(() => setFailed(true), []);
  const winners = contest?.winners || EMPTY;
  const has = winners.length > 0;
  const rows = failed ? winners : winners.slice(3);
  const showRows = has && rows.length > 0;

  return (
    <Box
      sx={[
        {
          position: 'relative', overflow: 'hidden', borderRadius: '28px', p: { xs: 1.75, sm: 2.5 },
          background: 'linear-gradient(160deg,#F5F3FF 0%,#EEF2FF 50%,#FDF2F8 100%)', border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 24px 50px -30px rgba(76,29,149,0.4)',
        },
        fill && { height: '100%', display: 'flex', flexDirection: 'column' },
      ]}
    >
      <Box aria-hidden sx={{ position: 'absolute', top: -70, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,114,182,0.35), transparent 70%)', pointerEvents: 'none' }} />
      <Box aria-hidden sx={{ position: 'absolute', bottom: -80, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.28), transparent 70%)', pointerEvents: 'none' }} />

      <Box sx={[{ position: 'relative' }, fill && { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }]}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box sx={{ width: 42, height: 42, flexShrink: 0, borderRadius: '14px', display: 'grid', placeItems: 'center', bgcolor: SOFT, boxShadow: RAISED_SM, color: '#F59E0B' }}>
              <EmojiEventsRoundedIcon />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: 18, sm: 21 }, color: INK, letterSpacing: '-0.01em', lineHeight: 1.2 }}>Contest top 10</Typography>
              <Typography noWrap sx={{ fontSize: 12.5, color: '#64748B', mt: 0.2 }}>{contest ? contest.title : 'Winners will stand here'}</Typography>
            </Box>
          </Box>
          {has && revealed && !failed && (
            <Tooltip title="Replay reveal">
              <IconButton aria-label="Replay reveal" onClick={onReplay} size="small" sx={{ bgcolor: SOFT, boxShadow: RAISED_SM, color: '#6366F1', '&:hover': { bgcolor: SOFT, boxShadow: PRESSED } }}>
                <ReplayRoundedIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {failed && !has && (
          <Box sx={{ mt: 2, py: 5, px: 3, textAlign: 'center', borderRadius: '24px', bgcolor: SOFT, boxShadow: PRESSED }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 42, color: '#F59E0B' }} />
            <Typography sx={{ fontWeight: 800, mt: 0.5, color: INK }}>{contest ? 'Results coming soon' : 'No contest finished yet'}</Typography>
          </Box>
        )}

        {!failed && (
          <Box
            sx={[
              {
                position: 'relative', mt: 2, overflow: 'hidden', borderRadius: '22px', height: { xs: 330, sm: 420 },
                bgcolor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.95)', boxShadow: `${PRESSED}, 0 18px 40px -28px rgba(99,102,241,0.5)`,
              },
              fill && { height: 'auto', flex: 1, minHeight: 190 },
            ]}
          >
            <Suspense fallback={<Skeleton variant="rounded" sx={{ position: 'absolute', inset: 14, height: 'auto', borderRadius: '16px' }} />}>
              <PodiumScene key={`${contest?.id || 'none'}-${runKey}`} winners={winners} revealed={revealed} reduce={Boolean(reduce)} onFail={onFail} />
            </Suspense>
            {!has && (
              <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 14, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
                <Box sx={{ px: 2.5, py: 1, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: RAISED_SM, textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: INK }}>{contest ? 'Results coming soon' : 'No contest finished yet'}</Typography>
                  <Typography sx={{ fontSize: 11.5, color: '#64748B' }}>{contest ? 'Winners appear once rankings are verified' : 'Winners will stand on this podium'}</Typography>
                </Box>
              </Box>
            )}
            {has && !revealed && (
              <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 14, display: 'grid', placeItems: 'center', gap: 0.75, pointerEvents: 'none' }}>
                <Button
                  onClick={onReveal} disableElevation startIcon={<BoltRoundedIcon />}
                  sx={{ pointerEvents: 'auto', px: 3.5, height: 44, borderRadius: '16px', color: '#fff', fontWeight: 800, background: 'linear-gradient(135deg,#FF9A3C,#FF3D81,#7C4DFF)', boxShadow: '0 14px 28px -12px rgba(124,77,255,0.8)', animation: `${nudge} 2s ease-in-out infinite`, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}
                >
                  Reveal winners
                </Button>
                <Typography sx={{ fontSize: 12, color: '#64748B' }}>Or tap the contest in the Past tab</Typography>
              </Box>
            )}
          </Box>
        )}

        {showRows && (
          <Box
            className="autohide-scroll"
            sx={{
              mt: 1.75, flexShrink: 0, display: 'grid', gap: 1.25, pb: { xs: 0.75, md: 0 },
              gridAutoFlow: { xs: 'column', md: 'row' }, gridAutoColumns: { xs: '132px', md: 'auto' },
              gridTemplateColumns: { md: 'repeat(auto-fill, minmax(128px, 1fr))' },
              overflowX: { xs: 'auto', md: 'visible' },
            }}
          >
            {rows.map((r, i) => (revealed || failed
              ? <RankCard key={r.rank} row={r} index={i} delay={failed ? 0.05 + i * 0.05 : 2.3 + i * 0.09} reduce={reduce} />
              : <LockedCard key={r.rank} rank={r.rank} />))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
