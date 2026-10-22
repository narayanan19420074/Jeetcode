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

const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };
const AMBER = '#FBBF24';

const MEDAL = {
  1: { a: '#FDE68A', b: '#F59E0B', text: '#451A03', glow: 'rgba(245,158,11,0.6)' },
  2: { a: '#F1F5F9', b: '#94A3B8', text: '#0F172A', glow: 'rgba(148,163,184,0.5)' },
  3: { a: '#FDBA74', b: '#C2410C', text: '#431407', glow: 'rgba(194,65,12,0.55)' },
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
      <Box sx={{ position: 'relative', p: '3.5px', borderRadius: '50%', background: grad(m), boxShadow: `0 8px 26px -6px ${m.glow}` }}>
        <Avatar
          src={row.avatarUrl || undefined} alt={row.name}
          sx={{ width: { xs: av - 14, sm: av }, height: { xs: av - 14, sm: av }, fontSize: av * 0.38, fontWeight: 800, border: '3px solid #1E1B4B', bgcolor: '#312E81', color: '#fff' }}
        >
          {row.name?.[0]?.toUpperCase()}
        </Avatar>
      </Box>
      <Box sx={{ position: 'absolute', bottom: -8, width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 12, color: m.text, background: grad(m), border: '2px solid #1E1B4B', ...mono }}>{rank}</Box>
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
        <EmojiEventsRoundedIcon sx={{ fontSize: { xs: 30, sm: 38 }, color: '#FDE68A', mb: 0.4, filter: 'drop-shadow(0 0 12px rgba(251,191,36,0.9))', animation: `${bob} 2.2s ease-in-out infinite`, ...calm }} />
      ) : <Box sx={{ height: { xs: 12, sm: 14 } }} />}

      <PodiumAvatar row={row} rank={rank} />

      <Typography noWrap sx={{ maxWidth: '100%', fontWeight: 800, fontSize: { xs: 12.5, sm: 14 }, mt: 1.5, px: 0.5 }}>{row.name}</Typography>
      <Typography noWrap sx={{ maxWidth: '100%', fontSize: 11, opacity: 0.7, mt: -0.1 }}>@{row.handle}</Typography>
      <Typography sx={[{ fontWeight: 900, fontSize: { xs: 15, sm: first ? 20 : 17 }, color: m.a, mt: 0.4, mb: 0.9 }, mono]}>
        {pts(row.score)}<Box component="span" sx={{ fontSize: 10, ml: 0.4, opacity: 0.85 }}>pts</Box>
      </Typography>

      {/* pedestal */}
      <Box
        sx={{
          position: 'relative', overflow: 'hidden', width: '100%', display: 'grid', placeItems: 'center',
          height: { xs: Math.round(h * 0.78), sm: h }, borderRadius: '14px 14px 0 0', background: grad(m),
          boxShadow: `0 -10px 30px -10px ${m.glow}, inset 0 1px 0 rgba(255,255,255,0.7)`,
          '&::before': { content: '""', position: 'absolute', inset: '0 0 auto 0', height: 12, background: 'linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0))' },
          '&::after': first ? { content: '""', position: 'absolute', top: 0, bottom: 0, width: '35%', background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent)', animation: `${sweep} 3.6s ease-in-out infinite`, ...calm } : undefined,
        }}
      >
        <Typography sx={[{ fontWeight: 900, fontSize: { xs: h * 0.36, sm: h * 0.42 }, lineHeight: 1, color: m.text, opacity: 0.8 }, mono]}>{rank}</Typography>
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
        position: 'relative', overflow: 'hidden', color: '#fff', px: { xs: 1.5, sm: 4 }, pt: { xs: 8.5, sm: 9 }, pb: 0,
        background: 'radial-gradient(120% 90% at 50% 0%, #5B21B6 0%, #312E81 45%, #1E1B4B 100%)',
      }}
    >
      <Box aria-hidden sx={{ position: 'absolute', left: '50%', top: 70, width: 320, height: 320, ml: '-160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.30), transparent 66%)', pointerEvents: 'none' }} />
      {SPARKS.map(([x, y, d]) => (
        <Box key={`${x}-${y}`} aria-hidden sx={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 4, height: 4, borderRadius: '50%', bgcolor: '#fff', animation: `${twinkle} 2.6s ease-in-out ${d}s infinite`, ...calm }} />
      ))}
      <Box sx={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${order.length}, minmax(0, 1fr))`, gap: { xs: 0.75, sm: 1.5 }, alignItems: 'end', maxWidth: 540, mx: 'auto' }}>
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
          display: 'flex', alignItems: 'center', gap: { xs: 1.1, sm: 1.5 }, px: { xs: 1.25, sm: 1.75 }, py: 1.1, borderRadius: '14px',
          border: `1px solid ${t.palette.divider}`, bgcolor: alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.03 : 0.015),
          transition: 'transform .18s, border-color .18s', '&:hover': { transform: 'translateY(-1px)', borderColor: alpha(t.palette.primary.main, 0.5) },
        })}
      >
        <Typography sx={(t) => ({ width: 30, height: 30, borderRadius: '10px', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 800, fontSize: 13, color: 'text.secondary', bgcolor: alpha(t.palette.text.primary, 0.07), ...mono })}>{row.rank}</Typography>
        <Avatar src={row.avatarUrl || undefined} alt={row.name} sx={{ width: 38, height: 38, fontSize: 15, fontWeight: 700 }}>{row.name?.[0]?.toUpperCase()}</Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, justifyContent: 'space-between' }}>
            <Typography noWrap sx={{ fontWeight: 800, fontSize: 14.5 }}>{row.name}</Typography>
            <Typography sx={[{ fontWeight: 900, fontSize: 14.5, flexShrink: 0 }, mono]}>{pts(row.score)}<Box component="span" sx={{ fontSize: 10, ml: 0.4, color: 'text.secondary' }}>pts</Box></Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mt: 0.15 }}>
            <Typography noWrap variant="caption" color="text.secondary" sx={{ minWidth: 0 }}>@{row.handle}</Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, color: 'text.secondary', flexShrink: 0 }}>
              <CodeRoundedIcon sx={{ fontSize: 13 }} /><Typography variant="caption" sx={{ fontWeight: 700 }}>{row.solved}</Typography>
            </Box>
            {row.streak > 0 && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.1, flexShrink: 0 }}>
                <LocalFireDepartmentRoundedIcon sx={{ fontSize: 14, color: AMBER }} /><Typography variant="caption" sx={{ fontWeight: 700 }}>{row.streak}d</Typography>
              </Box>
            )}
          </Box>
          <Box sx={(t) => ({ mt: 0.7, height: 5, borderRadius: 99, bgcolor: alpha(t.palette.text.primary, 0.08), overflow: 'hidden' })}>
            <Box sx={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #8B5CF6, #FBBF24)', transition: 'width .6s ease' }} />
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

// Global top 10 of all JeetCode players (same points as the Leaderboard tab), with a podium for the top 3.
export default function GlobalTop() {
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
    <Box sx={[surface, { overflow: 'hidden', p: 0 }]}>
      {/* header lives on the podium panel */}
      <Box sx={{ position: 'relative', background: '#1E1B4B' }}>
        <Box sx={{ position: 'absolute', zIndex: 2, left: 0, right: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: { xs: 1.75, sm: 2.5 }, pt: { xs: 1.75, sm: 2.25 }, color: '#fff' }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <PublicRoundedIcon sx={{ fontSize: 20, color: AMBER }} />
              <Typography sx={{ fontWeight: 900, fontSize: { xs: 18, sm: 21 }, letterSpacing: '-0.01em' }}>Global top 10</Typography>
            </Box>
            <Typography sx={{ fontSize: 12.5, opacity: 0.75, mt: 0.2 }}>Best players worldwide, all-time points</Typography>
          </Box>
          <Box sx={{ px: 1.1, py: 0.35, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.14)', fontSize: 11, fontWeight: 800, letterSpacing: 0.5, flexShrink: 0 }}>LIVE</Box>
        </Box>

        {status === 'loading' && (
          <Box sx={{ pt: 10, pb: 3, px: 3, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 1.5, alignItems: 'end', maxWidth: 540, mx: 'auto' }}>
            {[92, 124, 72].map((h) => <Skeleton key={h} variant="rounded" height={h + 60} sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: '14px' }} />)}
          </Box>
        )}
        {status === 'ok' && podium.length > 0 && <Podium rows={podium} reduce={reduce} />}
        {(status === 'error' || (status === 'ok' && podium.length === 0)) && (
          <Box sx={{ pt: 11, pb: 4, px: 3, textAlign: 'center', color: '#fff' }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 44, color: AMBER, opacity: 0.9 }} />
            <Typography sx={{ fontWeight: 800, mt: 0.5 }}>{status === 'error' ? 'Could not load the rankings' : 'The podium is waiting for its first champion'}</Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.75, mt: 0.25 }}>{status === 'error' ? 'Please try again in a moment.' : 'Solve questions to earn points and take the #1 spot.'}</Typography>
            {status === 'error' && <Button onClick={() => setTick((n) => n + 1)} sx={{ mt: 1.5, color: '#1B1200', bgcolor: AMBER, fontWeight: 800, '&:hover': { bgcolor: '#F5B50F' } }}>Retry</Button>}
          </Box>
        )}
      </Box>

      {status === 'ok' && rest.length > 0 && (
        <Box sx={{ p: { xs: 1.25, sm: 1.75 }, display: 'grid', gap: 0.9 }}>
          {rest.map((r, i) => <RankRow key={r.userId} row={r} top={rows[0].score} index={i} reduce={reduce} />)}
        </Box>
      )}
    </Box>
  );
}
