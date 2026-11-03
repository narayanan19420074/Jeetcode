import { lazy, Suspense, useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Avatar, Box, Button, IconButton, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { ACCENT, AVATAR_FRAMES, LB_DARK, LB_LIGHT } from '../leaderboard/lbTheme';
import { inr } from './contestUtils';
import { COLOR_PALETTE, withAlpha, FONT_WEIGHTS, FONT_SIZES, RADII_PX } from '../../app/design/designTokens';

// three.js is heavy, so it only downloads once the panel is on screen.
const PodiumScene = lazy(() => import('./PodiumScene'));

const EMPTY = [];
// Same Library palette as the leaderboard (lbTheme), plus the stage and chip colours only this panel uses.
// Glass needs a bright edge to read as glass: a white border on cream in light mode, a faint white one on dark surfaces.
const LIGHT = {
  ...LB_LIGHT,
  stage: withAlpha(COLOR_PALETTE.white, 0.45), stageBorder: `1px solid ${withAlpha(COLOR_PALETTE.white, 0.9)}`, stageGlow: `0 18px 40px -28px ${withAlpha(COLOR_PALETTE.custom.redEF6C4D, 0.4)}`,
  locked: COLOR_PALETTE.custom.grayA89888, pill: withAlpha(COLOR_PALETTE.orange[50], 0.85),
  prize: [COLOR_PALETTE.amber[100], COLOR_PALETTE.amber[700]], solved: [COLOR_PALETTE.emerald[100], COLOR_PALETTE.emerald[700]],
};
const DARK = {
  ...LB_DARK,
  stage: withAlpha(COLOR_PALETTE.white, 0.04), stageBorder: `1px solid ${withAlpha(COLOR_PALETTE.white, 0.10)}`, stageGlow: `0 18px 40px -26px ${withAlpha(COLOR_PALETTE.indigo[500], 0.5)}`,
  locked: COLOR_PALETTE.gray[700], pill: withAlpha(COLOR_PALETTE.gray[800], 0.85),
  prize: [withAlpha(COLOR_PALETTE.amber[400], 0.16), COLOR_PALETTE.amber[300]], solved: [withAlpha(COLOR_PALETTE.emerald[400], 0.16), COLOR_PALETTE.emerald[300]],
};

const BADGES = [COLOR_PALETTE.amber[500], COLOR_PALETTE.indigo[500], COLOR_PALETTE.custom.redEF6C4D, COLOR_PALETTE.teal[500], COLOR_PALETTE.blue[500], COLOR_PALETTE.violet[500], COLOR_PALETTE.orange[500]];
const badgeBg = (rank) => {
  const c = BADGES[(rank - 1) % BADGES.length];
  return `linear-gradient(135deg, ${c}, color-mix(in srgb, ${c} 60%, ${COLOR_PALETTE.indigo[700]}))`;
};

const nudge = keyframes`0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); }`;

function AvatarFrame({ row, size = 34, index, T }) {
  return (
    <Box sx={{ p: 0.5, borderRadius: '50%', flexShrink: 0, background: AVATAR_FRAMES[index % AVATAR_FRAMES.length], boxShadow: `0 6px 14px -6px ${withAlpha(COLOR_PALETTE.indigo[500], 0.55)}` }}>
      <Box sx={{ p: 0.5, borderRadius: '50%', bgcolor: T.frameInner }}>
        <Avatar src={row.avatarUrl || undefined} alt={row.name} sx={{ width: size, height: size, fontWeight: FONT_WEIGHTS.bold, fontSize: size * 0.4, color: T.avatarFg, bgcolor: T.avatarBg }}>
          {row.name?.[0]?.toUpperCase()}
        </Avatar>
      </Box>
    </Box>
  );
}

function Chip({ bg, fg, children }) {
  return <Box sx={{ px: 1, py: 0.5, borderRadius: RADII_PX.pill, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, whiteSpace: 'nowrap', bgcolor: bg, color: fg }}>{children}</Box>;
}

// Rank 4-10 as small cards so the whole top 10 fits one screen.
function RankCard({ row, index, delay, reduce, T }) {
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: reduce ? 0 : delay }} style={{ minWidth: 0 }}>
      <Box sx={{ height: '100%', p: 1.5, borderRadius: RADII_PX.card, bgcolor: T.soft, boxShadow: T.raised, display: 'grid', gap: 1, alignContent: 'start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ width: 28, height: 28, borderRadius: RADII_PX.control, display: 'grid', placeItems: 'center', color: COLOR_PALETTE.white, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, background: badgeBg(row.rank), boxShadow: `0 6px 12px -6px ${withAlpha(COLOR_PALETTE.indigo[500], 0.7)}` }}>{row.rank}</Box>
          <AvatarFrame row={row} index={index} T={T} />
        </Box>
        <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, color: T.ink }}>{row.name}</Typography>
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
    <Box sx={{ height: '100%', minHeight: 96, borderRadius: RADII_PX.card, bgcolor: T.soft, boxShadow: T.pressed, display: 'grid', placeItems: 'center', color: T.locked, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.heading }}>#{rank}</Box>
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
          position: 'relative', overflow: 'hidden', borderRadius: RADII_PX.card, p: { xs: 2, sm: 2.5 },
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
            <Box sx={{ width: 42, height: 42, flexShrink: 0, borderRadius: RADII_PX.card, display: 'grid', placeItems: 'center', bgcolor: T.soft, boxShadow: T.raised, color: COLOR_PALETTE.amber[500] }}>
              <EmojiEventsRoundedIcon />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: { xs: FONT_SIZES.subheading, sm: FONT_SIZES.heading }, color: T.ink, letterSpacing: '-0.01em', lineHeight: 1.2 }}>Contest top 10</Typography>
              <Typography noWrap sx={{ fontSize: FONT_SIZES.caption, color: T.muted, mt: 0.5 }}>{contest ? contest.title : 'Winners will stand here'}</Typography>
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
          <Box sx={{ mt: 2, py: 5, px: 3, textAlign: 'center', borderRadius: RADII_PX.card, bgcolor: T.soft, boxShadow: T.pressed }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: FONT_SIZES.heroLg, color: COLOR_PALETTE.amber[500] }} />
            <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, mt: 0.5, color: T.ink }}>{contest ? 'Results coming soon' : 'No contest finished yet'}</Typography>
          </Box>
        )}

        {!failed && (
          <Box
            sx={[
              {
                position: 'relative', mt: 2, overflow: 'hidden', borderRadius: RADII_PX.card, height: { xs: 330, sm: 420 },
                bgcolor: T.stage, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                border: T.stageBorder, boxShadow: `${T.pressed}, ${T.stageGlow}`,
              },
              fill && { height: 'auto', flex: 1, minHeight: 190 },
            ]}
          >
            <Suspense fallback={<Skeleton variant="rounded" sx={{ position: 'absolute', inset: 14, height: 'auto', borderRadius: RADII_PX.card }} />}>
              <PodiumScene key={`${contest?.id || 'none'}-${runKey}`} winners={winners} revealed={revealed} reduce={Boolean(reduce)} dark={T.dark} onFail={onFail} />
            </Suspense>
            {!has && (
              <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 14, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
                <Box sx={{ px: 2.5, py: 1, borderRadius: RADII_PX.pill, bgcolor: T.pill, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: T.raised, textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, color: T.ink }}>{contest ? 'Results coming soon' : 'No contest finished yet'}</Typography>
                  <Typography sx={{ fontSize: FONT_SIZES.caption, color: T.muted }}>{contest ? 'Winners appear once rankings are verified' : 'Winners will stand on this podium'}</Typography>
                </Box>
              </Box>
            )}
            {has && !revealed && (
              <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 14, display: 'grid', placeItems: 'center', gap: 1, pointerEvents: 'none' }}>
                <Button
                  onClick={onReveal} disableElevation startIcon={<BoltRoundedIcon />}
                  sx={{ pointerEvents: 'auto', px: 3.5, height: 44, borderRadius: RADII_PX.card, color: COLOR_PALETTE.white, fontWeight: FONT_WEIGHTS.bold, background: ACCENT, boxShadow: `0 14px 28px -12px ${withAlpha(COLOR_PALETTE.indigo[500], 0.7)}`, animation: `${nudge} 2s ease-in-out infinite`, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}
                >
                  Reveal winners
                </Button>
                <Typography sx={{ fontSize: FONT_SIZES.caption, color: T.muted }}>Or tap the contest in the Past tab</Typography>
              </Box>
            )}
          </Box>
        )}

        {showRows && (
          <Box
            className="autohide-scroll"
            sx={{
              mt: 2, flexShrink: 0, display: 'grid', gap: 1.5, pb: { xs: 1, md: 0 },
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
