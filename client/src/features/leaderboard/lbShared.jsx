import { useEffect, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { Avatar, Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { DIFF_COLOR } from '../dashboard/dashboardUtils';
import { PLAN_AMBER } from '../studyplan/planUtils';

// Bits shared by the leaderboard card (EmpireCard) and the side panel (LeaderboardView).

export const MEDAL = {
  1: { a: '#FDE68A', b: '#F59E0B', text: '#451A03', glow: 'rgba(245,158,11,0.55)' },
  2: { a: '#F1F5F9', b: '#94A3B8', text: '#0F172A', glow: 'rgba(148,163,184,0.5)' },
  3: { a: '#FDBA74', b: '#C2410C', text: '#431407', glow: 'rgba(194,65,12,0.5)' },
};
export const grad = (m) => `linear-gradient(135deg, ${m.a}, ${m.b})`;
export const APT_COLOR = '#8B5CF6';
export const PT = { easy: 10, medium: 20, hard: 40, aptitude: 5 };
export const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };

// ---- motion (all CSS, switched off for people who asked for less motion) ----
export const sweep = keyframes`0%{transform:translateX(-160%) skewX(-20deg)}60%,100%{transform:translateX(380%) skewX(-20deg)}`;
export const bob = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}`;
export const twinkle = keyframes`0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:1;transform:scale(1.15)}`;
export const glow = keyframes`0%,100%{opacity:.45}50%{opacity:1}`;
export const spin = keyframes`to{transform:rotate(360deg)}`;
export const calm = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } };

// Counts up to the score the first time it shows.
export function CountUp({ value }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) { setN(value); return undefined; }
    const c = animate(0, value, { duration: 1.1, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [value, reduce]);
  return n.toLocaleString();
}

const utcDay = (d = new Date()) => d.toISOString().slice(0, 10);
export function activeLabel(lastActive) {
  if (!lastActive) return { text: 'Not started', color: 'text.disabled', live: false };
  const days = Math.round((Date.parse(utcDay()) - Date.parse(lastActive)) / 86400000);
  if (days <= 0) return { text: 'Active today', color: 'success.main', live: true };
  if (days === 1) return { text: 'Active yesterday', color: 'warning.main', live: false };
  return { text: `${days}d ago`, color: 'text.disabled', live: false };
}

// Profile picture with a glowing gradient ring.
export function AvatarRing({ src, name, size = 34, a, b, ring = 2.5, inner = 'background.paper' }) {
  return (
    <Box sx={{ p: `${ring}px`, borderRadius: '50%', background: `linear-gradient(135deg, ${a}, ${b})`, display: 'inline-flex', flexShrink: 0 }}>
      <Avatar src={src || undefined} sx={{ width: size, height: size, fontSize: size * 0.4, fontWeight: 700, border: '2px solid', borderColor: inner }}>{name?.[0]?.toUpperCase()}</Avatar>
    </Box>
  );
}

// How a player's points split across Easy / Medium / Hard / Aptitude.
export function Mix({ row, onDark = false, sx }) {
  const parts = [
    [row.easy * PT.easy, DIFF_COLOR.Easy],
    [row.medium * PT.medium, DIFF_COLOR.Medium],
    [row.hard * PT.hard, DIFF_COLOR.Hard],
    [row.aptitude * PT.aptitude, APT_COLOR],
  ].filter(([v]) => v > 0);
  return (
    <Box aria-hidden sx={[{ display: 'flex', gap: '2px', height: 6, borderRadius: 99, overflow: 'hidden', bgcolor: onDark ? 'rgba(255,255,255,0.2)' : 'divider' }, sx]}>
      {parts.map(([v, c], i) => <Box key={i} sx={{ flex: v, bgcolor: c }} />)}
    </Box>
  );
}

export function YouChip() {
  return <Box component="span" sx={{ ml: 0.75, px: 0.8, borderRadius: 99, fontSize: 10.5, fontWeight: 800, color: '#1B1200', bgcolor: PLAN_AMBER, verticalAlign: 'middle', flexShrink: 0 }}>You</Box>;
}
