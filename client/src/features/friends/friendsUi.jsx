import { Avatar, Box, Stack, Typography, alpha } from '@mui/material';
import { keyframes } from '@emotion/react';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';

// Small pieces shared by the Friends page, chat, activity feed and profile dialog.
export const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };
export const APT_COLOR = '#8B5CF6';
export const FLAME = '#F97316';

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

export function PersonAvatar({ person, size = 40, online, ring }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <Avatar
        src={person.avatarUrl || undefined}
        sx={{ width: size, height: size, fontSize: size * 0.4, fontWeight: 700, ...(ring && { border: `3px solid ${ring}` }) }}
      >
        {person.name?.[0]?.toUpperCase()}
      </Avatar>
      {online && <OnlineDot size={Math.max(9, Math.round(size * 0.2))} sx={{ position: 'absolute', right: -2, bottom: -2 }} />}
    </Box>
  );
}

export function Streak({ value }) {
  if (!value) return null;
  return (
    <Stack direction="row" alignItems="center" spacing={0.25}>
      <LocalFireDepartmentRoundedIcon sx={{ fontSize: 17, color: FLAME }} />
      <Typography variant="caption" sx={{ fontWeight: 700, ...mono }}>{value}</Typography>
    </Stack>
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
