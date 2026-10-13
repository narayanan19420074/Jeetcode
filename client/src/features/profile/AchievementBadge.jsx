import { useId } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';

const GOLD = ['#FCD34D', '#D97706'];

// Hexagon badge. Earned = gold, not yet earned = greyed out with its progress.
export default function AchievementBadge({ top, value, caption, hint, earned }) {
  const id = useId();
  return (
    <Tooltip title={hint}>
      <Box sx={{ width: 76, flexShrink: 0, textAlign: 'center' }}>
        <Box sx={{ position: 'relative', width: 64, height: 72, mx: 'auto', filter: earned ? 'none' : 'grayscale(1)', opacity: earned ? 1 : 0.55 }}>
          <svg width="64" height="72" viewBox="0 0 56 64" aria-hidden="true">
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={GOLD[0]} />
                <stop offset="1" stopColor={GOLD[1]} />
              </linearGradient>
            </defs>
            <polygon points="28,2 52,16 52,48 28,62 4,48 4,16" fill={`url(#${id})`} />
            <polygon points="28,7 47,18 47,46 28,57 9,46 9,18" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
          </svg>
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#3B1D00' }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, lineHeight: 1 }}>{top}</Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontWeight: 700, lineHeight: 1.2, color: earned ? 'text.primary' : 'text.secondary' }}>
          {caption}
        </Typography>
      </Box>
    </Tooltip>
  );
}
