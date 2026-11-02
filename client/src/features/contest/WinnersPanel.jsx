import { lazy, Suspense, useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Avatar, Box, Button, IconButton, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { ACCENT, AVATAR_FRAMES, LB_DARK, LB_LIGHT } from '../leaderboard/lbTheme';
import { inr } from './contestUtils';

// three.js is heavy, so it only downloads once the panel is on screen.
const PodiumScene = lazy(() => import('./PodiumScene'));

const EMPTY = [];
// Same Library palette as the leaderboard (lbTheme), plus the stage and chip colours only this panel uses.
// Glass needs a bright edge to read as glass: a white border on cream in light mode, a faint white one on dark surfaces.
const LIGHT = {
  ...LB_LIGHT,
  stage: 'rgba(255,255,255,0.45)', stageBorder: '1px solid rgba(255,255,255,0.9)', stageGlow: '0 18px 40px -28px rgba(239,108,77,0.4)',
  locked: '#A89888', pill: 'rgba(253,248,244,0.85)',
  prize: ['#FEF3C7', '#B45309'], solved: ['#D1FAE5', '#047857'],
};
const DARK = {
  ...LB_DARK,
  stage: 'rgba(255,255,255,0.04)', stageBorder: '1px solid rgba(255,255,255,0.10)', stageGlow: '0 18px 40px -26px rgba(99,102,241,0.5)',
  locked: '#3A4452', pill: 'rgba(31,38,48,0.85)',
  prize: ['rgba(251,191,36,0.16)', '#FCD34D'], solved: ['rgba(52,211,153,0.16)', '#6EE7B7'],
};

const BADGES = ['#F59E0B', '#6366F1', '#EF6C4D', '#14B8A6', '#3B82F6', '#8B5CF6', '#F97316'];
const badgeBg = (rank) => {
  const c = BADGES[(rank - 1) % BADGES.length];
  return `linear-gradient(135deg, ${c}, color-mix(in srgb, ${c} 60%, #4338CA))`;
};

const nudge = keyframes`0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); }`;

function AvatarFrame({ row, size = 34, index, T }) {
  return (
    <Box sx={{ p: '3px', borderRadius: '50%', flexShrink: 0, background: AVATAR_FRAMES[index % AVATAR_FRAMES.length], boxShadow: '0 6px 14px -6px rgba(99,102,241,0.55)' }}>
      <Box sx={{ p: '2px', borderRadius: '50%', bgcolor: T.frameInner }}>
        <Avatar src={row.avatarUrl || undefined} alt={row.name} sx={{ width: size, height: size, fontWeight: 800, fontSize: size * 0.4, color: T.avatarFg, bgcolor: T.avatarBg }}>
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
function RankCard({ row, index, delay, reduce, T }) {
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: reduce ? 0 : delay }} style={{ minWidth: 0 }}>
      <Box sx={{ height: '100%', p: 1.4, borderRadius: '18px', bgcolor: T.soft, boxShadow: T.raised, display: 'grid', gap: 0.9, alignContent: 'start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900, fontSize: 13, background: badgeBg(row.rank), boxShadow: '0 6px 12px -6px rgba(99,102,241,0.7)' }}>{row.rank}</Box>
          <AvatarFrame row={row} index={index} T={T} />
        </Box>
        <Typography noWrap sx={{ fontWeight: 800, fontSize: 13.5, color: T.ink }}>{row.name}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {row.prize ? <Chip bg={T.prize[0]} fg={T.prize[1]}>{inr(row.prize)}</Chip> : null}
          <Chip bg={T.solved[0]} fg={T.solved[1]}>{row.solved ?? 0} solved</Chip>
        </Box>
      </Box>
    </motion.div>
  );
}

function LockedCard({ rank, T }) {
  return (
    <Box sx={{ height: '100%', minHeight: 96, borderRadius: '18px', bgcolor: T.soft, boxShadow: T.pressed, display: 'grid', placeItems: 'center', color: T.locked, fontWeight: 900, fontSize: 20 }}>#{rank}</Box>
  );
}

// Contest top 10: 3D glass podium for ranks 1-3 and small cards for 4-10. The podium is always on screen; with no
// finished contest (`contest` null) it stands empty. `revealed` flips when the person taps a past contest card
// (or the Reveal button), which starts the fireworks + rise animation. `fill` = stretch to the height its parent gives.
export default function WinnersPanel({ contest, revealed, runKey, onReveal, onReplay, fill = false }) {
  const reduce = useReducedMotion();
  const T = useTheme().palette.mode === 'dark' ? DARK : LIGHT;
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
          background: T.panel, border: T.border, boxShadow: T.panelShadow,
        },
        fill && { height: '100%', display: 'flex', flexDirection: 'column' },
      ]}
    >
      <Box aria-hidden sx={{ position: 'absolute', top: -70, right: -50, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${T.blobWarm}, transparent 70%)`, pointerEvents: 'none' }} />
      <Box aria-hidden sx={{ position: 'absolute', bottom: -80, left: -60, width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle, ${T.blobAccent}, transparent 70%)`, pointerEvents: 'none' }} />

      <Box sx={[{ position: 'relative' }, fill && { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }]}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box sx={{ width: 42, height: 42, flexShrink: 0, borderRadius: '14px', display: 'grid', placeItems: 'center', bgcolor: T.soft, boxShadow: T.raised, color: '#F59E0B' }}>
              <EmojiEventsRoundedIcon />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: 18, sm: 21 }, color: T.ink, letterSpacing: '-0.01em', lineHeight: 1.2 }}>Contest top 10</Typography>
              <Typography noWrap sx={{ fontSize: 12.5, color: T.muted, mt: 0.2 }}>{contest ? contest.title : 'Winners will stand here'}</Typography>
            </Box>
          </Box>
          {has && revealed && !failed && (
            <Tooltip title="Replay reveal">
              <IconButton aria-label="Replay reveal" onClick={onReplay} size="small" sx={{ bgcolor: T.soft, boxShadow: T.raised, color: T.icon, '&:hover': { bgcolor: T.soft, boxShadow: T.pressed } }}>
                <ReplayRoundedIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {failed && !has && (
          <Box sx={{ mt: 2, py: 5, px: 3, textAlign: 'center', borderRadius: '24px', bgcolor: T.soft, boxShadow: T.pressed }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 42, color: '#F59E0B' }} />
            <Typography sx={{ fontWeight: 800, mt: 0.5, color: T.ink }}>{contest ? 'Results coming soon' : 'No contest finished yet'}</Typography>
          </Box>
        )}

        {!failed && (
          <Box
            sx={[
              {
                position: 'relative', mt: 2, overflow: 'hidden', borderRadius: '22px', height: { xs: 330, sm: 420 },
                bgcolor: T.stage, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                border: T.stageBorder, boxShadow: `${T.pressed}, ${T.stageGlow}`,
              },
              fill && { height: 'auto', flex: 1, minHeight: 190 },
            ]}
          >
            <Suspense fallback={<Skeleton variant="rounded" sx={{ position: 'absolute', inset: 14, height: 'auto', borderRadius: '16px' }} />}>
              <PodiumScene key={`${contest?.id || 'none'}-${runKey}`} winners={winners} revealed={revealed} reduce={Boolean(reduce)} dark={T.dark} onFail={onFail} />
            </Suspense>
            {!has && (
              <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 14, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
                <Box sx={{ px: 2.5, py: 1, borderRadius: 99, bgcolor: T.pill, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: T.raised, textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: T.ink }}>{contest ? 'Results coming soon' : 'No contest finished yet'}</Typography>
                  <Typography sx={{ fontSize: 11.5, color: T.muted }}>{contest ? 'Winners appear once rankings are verified' : 'Winners will stand on this podium'}</Typography>
                </Box>
              </Box>
            )}
            {has && !revealed && (
              <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 14, display: 'grid', placeItems: 'center', gap: 0.75, pointerEvents: 'none' }}>
                <Button
                  onClick={onReveal} disableElevation startIcon={<BoltRoundedIcon />}
                  sx={{ pointerEvents: 'auto', px: 3.5, height: 44, borderRadius: '16px', color: '#fff', fontWeight: 800, background: ACCENT, boxShadow: '0 14px 28px -12px rgba(99,102,241,0.7)', animation: `${nudge} 2s ease-in-out infinite`, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}
                >
                  Reveal winners
                </Button>
                <Typography sx={{ fontSize: 12, color: T.muted }}>Or tap the contest in the Past tab</Typography>
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
              ? <RankCard key={r.rank} row={r} index={i} delay={failed ? 0.05 + i * 0.05 : 2.3 + i * 0.09} reduce={reduce} T={T} />
              : <LockedCard key={r.rank} rank={r.rank} T={T} />))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
