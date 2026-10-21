import { useEffect, useState } from 'react';
import { Avatar, Box, Typography, alpha } from '@mui/material';
import { keyframes } from '@emotion/react';
import { animate, useReducedMotion } from 'framer-motion';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';

// Small pieces shared by the Friends page, chat, activity feed and profile dialog.
export const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };
export const APT_COLOR = '#8B5CF6';
export const FLAME = '#F97316';
export const AMBER = '#FBBF24';
export const GREEN = '#22C55E';
export const HERO_BG = 'linear-gradient(160deg,#1E1B4B 0%,#312E81 55%,#5B21B6 100%)';

// Same motion vocabulary as the Leaderboard page (all CSS, off for "reduce motion").
export const flicker = keyframes`0%,100%{transform:scale(1) rotate(-3deg)}50%{transform:scale(1.2) rotate(4deg)}`;
export const sweep = keyframes`0%{transform:translateX(-160%) skewX(-20deg)}60%,100%{transform:translateX(380%) skewX(-20deg)}`;
export const twinkle = keyframes`0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:1;transform:scale(1.15)}`;
export const glow = keyframes`0%,100%{opacity:.45}50%{opacity:1}`;
export const calm = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } };

// Leaderboard-style row card: hairline gradient border, optional coloured glow.
//   accent = [from, to] colours for a highlighted (gradient) border, e.g. friends who are online.
export const cardSx = (t, { accent, glowColor, mb = 0.85 } = {}) => {
  const paper = t.palette.background.paper;
  return {
    mx: 1,
    mb,
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative',
    border: '1.5px solid transparent',
    background: accent
      ? `linear-gradient(${paper}, ${paper}) padding-box, linear-gradient(135deg, ${accent[0]}, ${accent[1]}) border-box`
      : `linear-gradient(${paper}, ${paper}) padding-box, linear-gradient(${t.palette.divider}, ${t.palette.divider}) border-box`,
    boxShadow: glowColor ? `0 10px 24px -14px ${glowColor}` : 'none',
  };
};

// Counts up to a number the first time it shows.
export function CountUp({ value }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) { setN(value); return undefined; }
    const c = animate(0, value, { duration: 0.9, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [value, reduce]);
  return n.toLocaleString();
}

export function TierChip({ tier }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, px: 0.7, py: 0.05, borderRadius: 99, bgcolor: `color-mix(in srgb, ${tier.color} 16%, transparent)`, color: tier.color, fontSize: 11, fontWeight: 800, lineHeight: 1.6 }}>
      <WorkspacePremiumRoundedIcon sx={{ fontSize: 13 }} />{tier.name}
    </Box>
  );
}

// Round tonal icon button — the one button style used across the Friends page.
export const tonal = (color = 'primary', size = 40) => (t) => ({
  width: size,
  height: size,
  flexShrink: 0,
  color: `${color}.main`,
  bgcolor: alpha(t.palette[color].main, 0.12),
  '&:hover': { bgcolor: alpha(t.palette[color].main, 0.22) },
  '&.Mui-disabled': { color: 'text.disabled', bgcolor: 'action.hover' },
});

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.55); }
  70% { box-shadow: 0 0 0 7px rgba(34,197,94,0); }
  100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
`;

// Green "online now" dot that gently pulses (still for people who prefer reduced motion).
export function OnlineDot({ size = 11, sx }) {
  return (
    <Box
      component="span"
      aria-label="Online now"
      sx={[
        (t) => ({
          width: size,
          height: size,
          borderRadius: '50%',
          bgcolor: '#22C55E',
          border: `2px solid ${t.palette.background.paper}`,
          boxSizing: 'content-box',
          animation: `${pulse} 2.2s ease-out infinite`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}

// `gradient` = [from, to] draws the glowing ring used on the Leaderboard; `ring` = plain solid ring.
export function PersonAvatar({ person, size = 40, online, ring, gradient }) {
  const avatar = (
    <Avatar
      src={person.avatarUrl || undefined}
      sx={[
        { width: size, height: size, fontSize: size * 0.4, fontWeight: 700 },
        gradient ? { border: '2px solid', borderColor: 'background.paper' } : ring ? { border: `3px solid ${ring}` } : null,
      ]}
    >
      {person.name?.[0]?.toUpperCase()}
    </Avatar>
  );
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      {gradient ? (
        <Box sx={{ p: '2.5px', borderRadius: '50%', display: 'inline-flex', background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}>{avatar}</Box>
      ) : avatar}
      {online && <OnlineDot size={Math.max(9, Math.round(size * 0.2))} sx={{ position: 'absolute', right: -2, bottom: -2 }} />}
    </Box>
  );
}

export function Streak({ value }) {
  const on = value > 0;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.15 }}>
      <LocalFireDepartmentRoundedIcon
        sx={{ fontSize: 16, color: on ? FLAME : 'text.disabled', ...(on && { animation: `${flicker} 1.4s ease-in-out infinite`, filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.7))', ...calm }) }}
      />
      <Typography variant="caption" sx={[{ fontWeight: 800, color: on ? 'text.primary' : 'text.disabled' }, mono]}>{value || 0}d</Typography>
    </Box>
  );
}

const todayKey = () => new Date().toISOString().slice(0, 10);

// Days since the YYYY-MM-DD the server sends (UTC, like the streak logic).
export const daysSince = (lastActive) => (lastActive ? Math.round((Date.parse(todayKey()) - Date.parse(lastActive)) / 86400000) : null);

// Status line under a friend's name. Live presence wins over the daily "active" date.
export function statusInfo(person, online) {
  if (online) return { text: 'Online now', live: true, color: '#22C55E' };
  const d = daysSince(person.lastActive);
  if (d === null) return { text: 'Not started yet', live: false };
  if (d <= 0) return { text: 'Active today', live: false };
  if (d === 1) return { text: 'Active yesterday', live: false };
  return { text: `Active ${d}d ago`, live: false };
}

// Has this friend practised today? (decides whether a nudge makes sense)
export const practisedToday = (person) => daysSince(person.lastActive) === 0;

export function timeAgo(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function dayLabel(iso) {
  const d = new Date(iso);
  const start = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(new Date()) - start(d)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}
