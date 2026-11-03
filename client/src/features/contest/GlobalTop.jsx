import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Avatar, Box, Button, Skeleton, Typography, alpha } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { leaderboardApi } from '../../api/studyPlanApi';
import { surface } from '../dashboard/dashboardUtils';
import { COLOR_PALETTE, withAlpha, FONTS, FONT_WEIGHTS, FONT_SIZES, RADII, RADII_PX, RANK_TEXT_RATIO, Z_INDEX, MOTION, SHADOWS } from '../../app/design/designTokens';

const mono = { fontFamily: FONTS.mono, fontVariantNumeric: 'tabular-nums' };
const AMBER = COLOR_PALETTE.amber[400];

const MEDAL = {
  1: { a: COLOR_PALETTE.amber[200], b: COLOR_PALETTE.amber[500], text: COLOR_PALETTE.amber[950], glow: withAlpha(COLOR_PALETTE.amber[500], 0.6) },
  2: { a: COLOR_PALETTE.slate[100], b: COLOR_PALETTE.slate[400], text: COLOR_PALETTE.slate[900], glow: withAlpha(COLOR_PALETTE.slate[400], 0.5) },
  3: { a: COLOR_PALETTE.orange[300], b: COLOR_PALETTE.orange[700], text: COLOR_PALETTE.orange[950], glow: withAlpha(COLOR_PALETTE.orange[700], 0.55) },
};
const grad = (m) => `linear-gradient(160deg, ${m.a}, ${m.b})`;
// Podium geometry per rank: pedestal height + avatar size (desktop), phones get a scaled-down version.
const GEO = { 1: { h: 124, av: 78 }, 2: { h: 92, av: 62 }, 3: { h: 72, av: 62 } };

const spin = keyframes`to { transform: rotate(360deg); }`;
const bob = keyframes`0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); }`;
const twinkle = keyframes`0%,100% { opacity: .15; transform: scale(.7); } 50% { opacity: 1; transform: scale(1.25); }`;
const sweep = keyframes`0% { left: -45%; } 100% { left: 130%; }`;
const calm = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } };
const SPARKS = [[8, 22, 0], [18, 60, 0.7], [30, 12, 1.2], [70, 16, 0.4], [84, 54, 1.5], [92, 24, 0.9], [52, 8, 1.8], [12, 84, 1.1], [88, 82, 0.2]];

const pts = (n) => Number(n || 0).toLocaleString('en-IN');

function PodiumAvatar({ row, rank }) {
  const m = MEDAL[rank];
  const { av } = GEO[rank];
  return (
    <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
      {rank === 1 && (
        <Box aria-hidden sx={{ position: 'absolute', width: { xs: av - 4, sm: av + 22 }, height: { xs: av - 4, sm: av + 22 }, borderRadius: '50%', background: `conic-gradient(from 0deg, ${m.a}, transparent 30%, ${m.b} 55%, transparent 80%, ${m.a})`, filter: 'blur(5px)', opacity: 0.9, animation: `${spin} 6s linear infinite`, ...calm }} />
      )}
      <Box sx={{ position: 'relative', p: 0.5, borderRadius: '50%', background: grad(m), boxShadow: SHADOWS.drop('lg', m.glow) }}>
        <Avatar
          src={row.avatarUrl || undefined} alt={row.name}
          sx={{ width: { xs: av - 14, sm: av }, height: { xs: av - 14, sm: av }, fontSize: av * 0.38, fontWeight: FONT_WEIGHTS.bold, border: `3px solid ${COLOR_PALETTE.indigo[950]}`, bgcolor: COLOR_PALETTE.indigo[900], color: COLOR_PALETTE.white }}
        >
          {row.name?.[0]?.toUpperCase()}
        </Avatar>
      </Box>
      <Box sx={{ position: 'absolute', bottom: -8, width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.caption, color: m.text, background: grad(m), border: `2px solid ${COLOR_PALETTE.indigo[950]}`, ...mono }}>{rank}</Box>
    </Box>
  );
}

function PodiumColumn({ row, rank, delay, reduce }) {
  const m = MEDAL[rank];
  const { h } = GEO[rank];
  const first = rank === 1;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 15, delay: reduce ? 0 : delay }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}
    >
      {first ? (
        <EmojiEventsRoundedIcon sx={{ fontSize: { xs: FONT_SIZES.hero, sm: FONT_SIZES.heroLg }, color: COLOR_PALETTE.amber[200], mb: 0.5, filter: `drop-shadow(0 0 12px ${withAlpha(COLOR_PALETTE.amber[400], 0.9)})`, animation: `${bob} 2.2s ease-in-out infinite`, ...calm }} />
      ) : <Box sx={{ height: { xs: 12, sm: 14 } }} />}

      <PodiumAvatar row={row} rank={rank} />

      <Typography noWrap sx={{ maxWidth: '100%', fontWeight: FONT_WEIGHTS.bold, fontSize: { xs: FONT_SIZES.caption, sm: FONT_SIZES.body }, mt: 1.5, px: 0.5 }}>{row.name}</Typography>
      <Typography noWrap sx={{ maxWidth: '100%', fontSize: FONT_SIZES.micro, opacity: 0.7, mt: -0.1 }}>@{row.handle}</Typography>
      <Typography sx={[{ fontWeight: FONT_WEIGHTS.bold, fontSize: { xs: FONT_SIZES.bodyLg, sm: first ? FONT_SIZES.heading : FONT_SIZES.subheading }, color: m.a, mt: 0.5, mb: 1 }, mono]}>
        {pts(row.score)}<Box component="span" sx={{ fontSize: FONT_SIZES.micro, ml: 0.5, opacity: 0.85 }}>pts</Box>
      </Typography>

      {/* pedestal */}
      <Box
        sx={{
          position: 'relative', overflow: 'hidden', width: '100%', display: 'grid', placeItems: 'center',
          height: { xs: Math.round(h * 0.78), sm: h }, borderRadius: `${RADII.card}px ${RADII.card}px 0 0`, background: grad(m),
          boxShadow: `0 -10px 30px -10px ${m.glow}, inset 0 1px 0 ${withAlpha(COLOR_PALETTE.white, 0.7)}`,
          '&::before': { content: '""', position: 'absolute', inset: '0 0 auto 0', height: 12, background: `linear-gradient(180deg, ${withAlpha(COLOR_PALETTE.white, 0.6)}, ${withAlpha(COLOR_PALETTE.white, 0)})` },
          '&::after': first ? { content: '""', position: 'absolute', top: 0, bottom: 0, width: '35%', background: `linear-gradient(100deg, transparent, ${withAlpha(COLOR_PALETTE.white, 0.55)}, transparent)`, animation: `${sweep} 3.6s ease-in-out infinite`, ...calm } : undefined,
        }}
      >
        <Typography sx={[{ fontWeight: FONT_WEIGHTS.bold, fontSize: { xs: h * RANK_TEXT_RATIO.xs, sm: h * RANK_TEXT_RATIO.sm }, lineHeight: 1, color: m.text, opacity: 0.8 }, mono]}>{rank}</Typography>
      </Box>
    </motion.div>
  );
}

function Podium({ rows, reduce }) {
  // visual order: 2nd | 1st | 3rd
  const order = [1, 0, 2].filter((i) => rows[i]);
  return (
    <Box
      sx={{
        position: 'relative', overflow: 'hidden', color: COLOR_PALETTE.white, px: { xs: 1.5, sm: 4 }, pt: { xs: 8.5, sm: 8.5 }, pb: 0,
        background: `radial-gradient(120% 90% at 50% 0%, ${COLOR_PALETTE.violet[800]} 0%, ${COLOR_PALETTE.indigo[900]} 45%, ${COLOR_PALETTE.indigo[950]} 100%)`,
      }}
    >
      <Box aria-hidden sx={{ position: 'absolute', left: '50%', top: 70, width: 320, height: 320, ml: -20, borderRadius: '50%', background: `radial-gradient(circle, ${withAlpha(COLOR_PALETTE.amber[400], 0.30)}, transparent 66%)`, pointerEvents: 'none' }} />
      {SPARKS.map(([x, y, d]) => (
        <Box key={`${x}-${y}`} aria-hidden sx={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 4, height: 4, borderRadius: '50%', bgcolor: COLOR_PALETTE.white, animation: `${twinkle} 2.6s ease-in-out ${d}s infinite`, ...calm }} />
      ))}
      <Box sx={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${order.length}, minmax(0, 1fr))`, gap: { xs: 1, sm: 1.5 }, alignItems: 'end', maxWidth: 540, mx: 'auto' }}>
        {order.map((i) => <PodiumColumn key={rows[i].userId} row={rows[i]} rank={i + 1} delay={(2 - i) * 0.12} reduce={reduce} />)}
      </Box>
    </Box>
  );
}

function RankRow({ row, top, index, reduce }) {
  const pct = top > 0 ? Math.max(6, Math.round((row.score / top) * 100)) : 0;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: reduce ? 0 : 0.35 + index * 0.05 }}
    >
      <Box
        sx={(t) => ({
          display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, px: { xs: 1.5, sm: 2 }, py: 1, borderRadius: RADII_PX.card,
          border: `1px solid ${t.palette.divider}`, bgcolor: alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.03 : 0.015),
          transition: `transform ${MOTION.standard}ms, border-color ${MOTION.standard}ms`, '&:hover': { transform: 'translateY(-1px)', borderColor: alpha(t.palette.primary.main, 0.5) },
        })}
      >
        <Typography sx={(t) => ({ width: 30, height: 30, borderRadius: RADII_PX.control, display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, color: 'text.secondary', bgcolor: alpha(t.palette.text.primary, 0.07), ...mono })}>{row.rank}</Typography>
        <Avatar src={row.avatarUrl || undefined} alt={row.name} sx={{ width: 38, height: 38, fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.bold }}>{row.name?.[0]?.toUpperCase()}</Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, justifyContent: 'space-between' }}>
            <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg }}>{row.name}</Typography>
            <Typography sx={[{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg, flexShrink: 0 }, mono]}>{pts(row.score)}<Box component="span" sx={{ fontSize: FONT_SIZES.micro, ml: 0.5, color: 'text.secondary' }}>pts</Box></Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
            <Typography noWrap variant="caption" color="text.secondary" sx={{ minWidth: 0 }}>@{row.handle}</Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', flexShrink: 0 }}>
              <CodeRoundedIcon sx={{ fontSize: FONT_SIZES.body }} /><Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold }}>{row.solved}</Typography>
            </Box>
            {row.streak > 0 && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                <LocalFireDepartmentRoundedIcon sx={{ fontSize: FONT_SIZES.body, color: AMBER }} /><Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold }}>{row.streak}d</Typography>
              </Box>
            )}
          </Box>
          <Box sx={(t) => ({ mt: 0.5, height: 5, borderRadius: RADII_PX.pill, bgcolor: alpha(t.palette.text.primary, 0.08), overflow: 'hidden' })}>
            <Box sx={{ width: `${pct}%`, height: '100%', borderRadius: RADII_PX.pill, background: `linear-gradient(90deg, ${COLOR_PALETTE.violet[500]}, ${COLOR_PALETTE.amber[400]})`, transition: `width ${MOTION.progress}ms ease` }} />
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

// Global top 10 of all JeetCode players (same points as the Leaderboard tab), with a podium for the top 3.
export default function GlobalTop({ fill = false }) {
  const reduce = useReducedMotion();
  const [state, setState] = useState({ status: 'loading', rows: [] });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let off = false;
    setState({ status: 'loading', rows: [] });
    leaderboardApi
      .get({ period: 'all', scope: 'global', track: 'overall', page: 1, limit: 10 })
      .then(({ data }) => {
        if (off) return;
        const rows = (data.data.rows || []).filter((r) => !r.padded && r.score > 0).slice(0, 10);
        setState({ status: 'ok', rows });
      })
      .catch(() => !off && setState({ status: 'error', rows: [] }));
    return () => { off = true; };
  }, [tick]);

  const { status, rows } = state;
  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <Box sx={[surface, { overflow: 'hidden', p: 0 }, fill && { height: '100%', display: 'flex', flexDirection: 'column' }]}>
      {/* header lives on the podium panel */}
      <Box sx={{ position: 'relative', background: COLOR_PALETTE.indigo[950], flexShrink: 0 }}>
        <Box sx={{ position: 'absolute', zIndex: Z_INDEX.raised, left: 0, right: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: { xs: 2, sm: 2.5 }, pt: { xs: 2, sm: 2.5 }, color: COLOR_PALETTE.white }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PublicRoundedIcon sx={{ fontSize: FONT_SIZES.heading, color: AMBER }} />
              <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: { xs: FONT_SIZES.subheading, sm: FONT_SIZES.heading }, letterSpacing: '-0.01em' }}>Global top 10</Typography>
            </Box>
            <Typography sx={{ fontSize: FONT_SIZES.caption, opacity: 0.75, mt: 0.5 }}>Best players worldwide, all-time points</Typography>
          </Box>
          <Box sx={{ px: 1, py: 0.5, borderRadius: RADII_PX.pill, bgcolor: withAlpha(COLOR_PALETTE.white, 0.14), fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, letterSpacing: 0.5, flexShrink: 0 }}>LIVE</Box>
        </Box>

        {status === 'loading' && (
          <Box sx={{ pt: 10, pb: 3, px: 3, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 1.5, alignItems: 'end', maxWidth: 540, mx: 'auto' }}>
            {[92, 124, 72].map((h) => <Skeleton key={h} variant="rounded" height={h + 60} sx={{ bgcolor: withAlpha(COLOR_PALETTE.white, 0.12), borderRadius: RADII_PX.card }} />)}
          </Box>
        )}
        {status === 'ok' && podium.length > 0 && <Podium rows={podium} reduce={reduce} />}
        {(status === 'error' || (status === 'ok' && podium.length === 0)) && (
          <Box sx={{ pt: 11, pb: 4, px: 3, textAlign: 'center', color: COLOR_PALETTE.white }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: FONT_SIZES.jumbo, color: AMBER, opacity: 0.9 }} />
            <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, mt: 0.5 }}>{status === 'error' ? 'Could not load the rankings' : 'The podium is waiting for its first champion'}</Typography>
            <Typography sx={{ fontSize: FONT_SIZES.body, opacity: 0.75, mt: 0.5 }}>{status === 'error' ? 'Please try again in a moment.' : 'Solve questions to earn points and take the #1 spot.'}</Typography>
            {status === 'error' && <Button onClick={() => setTick((n) => n + 1)} sx={{ mt: 1.5, color: COLOR_PALETTE.custom.black1B1200, bgcolor: AMBER, fontWeight: FONT_WEIGHTS.bold, '&:hover': { bgcolor: COLOR_PALETTE.amber[400] } }}>Retry</Button>}
          </Box>
        )}
      </Box>

      {status === 'ok' && rest.length > 0 && (
        <Box className="autohide-scroll" sx={[{ p: { xs: 1.5, sm: 2 }, display: 'grid', gap: 1, alignContent: 'start' }, fill && { flex: 1, minHeight: 0, overflowY: 'auto' }]}>
          {rest.map((r, i) => <RankRow key={r.userId} row={r} top={rows[0].score} index={i} reduce={reduce} />)}
        </Box>
      )}
    </Box>
  );
}
