import { Box, Typography } from '@mui/material';
import { COLOR_PALETTE, MOTION } from '../app/design/designTokens';

const TRACK_OPACITY = 0.12;

// Faint full circle plus the filled arc; the arc length is the share of `value` in `max`.
function RingGraphic({ size, strokeWidth, color, fraction }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const circle = { cx: size / 2, cy: size / 2, r: radius, fill: 'none', strokeWidth };
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle {...circle} stroke="currentColor" opacity={TRACK_OPACITY} />
      <circle
        {...circle}
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - fraction)}
        strokeLinecap="round"
        style={{ transition: `stroke-dashoffset ${MOTION.progress}ms ease` }}
      />
    </svg>
  );
}

function RingLabels({ value, max, label, color, mutedColor }) {
  return (
    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h5" sx={{ fontWeight: 'fontWeightBold', lineHeight: 1 }}>{value}</Typography>
      <Typography variant="caption" sx={{ color: mutedColor }}>/ {max}</Typography>
      {label && <Typography variant="caption" sx={{ mt: 0.5, fontWeight: 'fontWeightBold', color }}>{label}</Typography>}
    </Box>
  );
}

export default function ProgressRing({ value, max, label, color = COLOR_PALETTE.blue[500], size = 120, strokeWidth = 10, mutedColor = 'text.secondary' }) {
  const fraction = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <Box sx={{ position: 'relative', width: size, height: size, display: 'inline-flex' }}>
      <RingGraphic size={size} strokeWidth={strokeWidth} color={color} fraction={fraction} />
      <RingLabels value={value} max={max} label={label} color={color} mutedColor={mutedColor} />
    </Box>
  );
}
