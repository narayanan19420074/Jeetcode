import { lazy, Suspense, useCallback, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Box, Button, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { surface } from '../dashboard/dashboardUtils';
import { inr } from './contestUtils';

// three.js is heavy, so it only downloads when a finished contest actually has winners to show.
const PodiumScene = lazy(() => import('./PodiumScene'));

const AMBER = '#FBBF24';
const EMPTY = [];
const nudge = keyframes`0%,100% { transform: translateY(0); box-shadow: 0 10px 26px -10px rgba(251,191,36,0.9); } 50% { transform: translateY(-3px); box-shadow: 0 16px 34px -10px rgba(251,191,36,1); }`;

function PlainWinners({ winners }) {
  return (
    <Box sx={{ display: 'grid', gap: 1, p: 2.5, pt: 11 }}>
      {winners.map((w) => (
        <Box key={w.rank} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.1)' }}>
          <Typography sx={{ fontWeight: 900, width: 28, color: AMBER }}>#{w.rank}</Typography>
          <Typography sx={{ fontWeight: 800, flex: 1, minWidth: 0 }} noWrap>{w.name}</Typography>
          <Typography sx={{ fontWeight: 800, color: AMBER }}>{w.prize ? inr(w.prize) : `${w.solved ?? 0} solved`}</Typography>
        </Box>
      ))}
    </Box>
  );
}

// Winners of a finished contest on a glass podium. `revealed` flips when the person taps a past contest card
// (or the Reveal button); that starts the fireworks + rise animation.
export default function WinnersPanel({ contest, revealed, runKey, onReveal, onReplay }) {
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const onFail = useCallback(() => setFailed(true), []);
  const winners = contest.winners || EMPTY;
  const has = winners.length > 0;

  return (
    <Box sx={[surface, { overflow: 'hidden', p: 0 }]}>
      <Box sx={{ position: 'relative', color: '#fff', background: 'radial-gradient(120% 90% at 50% 0%, #5B21B6 0%, #312E81 45%, #1E1B4B 100%)' }}>
        <Box sx={{ position: 'absolute', zIndex: 2, left: 0, right: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: { xs: 1.75, sm: 2.5 }, pt: { xs: 1.75, sm: 2.25 }, pointerEvents: 'none' }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <EmojiEventsRoundedIcon sx={{ fontSize: 22, color: AMBER }} />
              <Typography sx={{ fontWeight: 900, fontSize: { xs: 18, sm: 21 }, letterSpacing: '-0.01em' }}>Contest winners</Typography>
            </Box>
            <Typography noWrap sx={{ fontSize: 12.5, opacity: 0.75, mt: 0.2 }}>{contest.title}</Typography>
          </Box>
          {has && revealed && !failed && (
            <Tooltip title="Replay reveal">
              <IconButton aria-label="Replay reveal" onClick={onReplay} size="small" sx={{ pointerEvents: 'auto', color: '#fff', bgcolor: 'rgba(255,255,255,0.14)', '&:hover': { bgcolor: 'rgba(255,255,255,0.24)' } }}>
                <ReplayRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {!has && (
          <Box sx={{ pt: 11, pb: 5, px: 3, textAlign: 'center' }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 46, color: AMBER, opacity: 0.9 }} />
            <Typography sx={{ fontWeight: 800, mt: 0.5 }}>Results coming soon</Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.75, mt: 0.25 }}>Winners appear here once the organizers verify the rankings.</Typography>
          </Box>
        )}

        {has && failed && <PlainWinners winners={winners} />}

        {has && !failed && (
          <Box sx={{ position: 'relative', height: { xs: 380, sm: 460 } }}>
            <Suspense fallback={<Skeleton variant="rounded" sx={{ position: 'absolute', inset: '84px 16px 16px', height: 'auto', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '16px' }} />}>
              <PodiumScene key={`${contest.id}-${runKey}`} winners={winners} revealed={revealed} reduce={Boolean(reduce)} onFail={onFail} />
            </Suspense>
            {!revealed && (
              <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: { xs: 18, sm: 24 }, display: 'grid', placeItems: 'center', gap: 0.75, pointerEvents: 'none' }}>
                <Button
                  onClick={onReveal} disableElevation startIcon={<BoltRoundedIcon />}
                  sx={{ pointerEvents: 'auto', px: 3, height: 46, borderRadius: '14px', bgcolor: AMBER, color: '#1B1200', fontWeight: 800, animation: `${nudge} 2s ease-in-out infinite`, '&:hover': { bgcolor: '#F5B50F' }, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}
                >
                  Reveal winners
                </Button>
                <Typography sx={{ fontSize: 12, opacity: 0.75 }}>Or tap the contest in the Past tab</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
