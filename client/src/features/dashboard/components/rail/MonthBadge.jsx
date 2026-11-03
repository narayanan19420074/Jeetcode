import { Box, Tooltip, Typography } from '@mui/material';
import { GOLD_A, GOLD_B } from './railTokens';
import { COLOR_PALETTE, withAlpha, FONT_WEIGHTS, FONT_SIZES } from '../../../../app/design/designTokens';

function HexShape() {
  return (
    <svg width="56" height="64" viewBox="0 0 56 64" aria-hidden="true">
      <defs>
        <linearGradient id="badgeGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={GOLD_A} />
          <stop offset="1" stopColor={GOLD_B} />
        </linearGradient>
      </defs>
      <polygon points="28,2 52,16 52,48 28,62 4,48 4,16" fill="url(#badgeGold)" />
      <polygon points="28,7 47,18 47,46 28,57 9,46 9,18" fill="none" stroke={withAlpha(COLOR_PALETTE.white, 0.55)} strokeWidth="1.5" />
    </svg>
  );
}

function BadgeLabel({ label, count, goal }) {
  return (
    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: COLOR_PALETTE.yellow[950] }}>
      <Typography sx={{ fontSize: '0.62rem', fontWeight: FONT_WEIGHTS.bold, lineHeight: 1 }}>{label}</Typography>
      <Typography sx={{ fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' }}>
        {Math.min(count, goal)}
        <Box component="span" sx={{ fontSize: '0.6rem', fontWeight: FONT_WEIGHTS.bold }}>
          /{goal}
        </Box>
      </Typography>
    </Box>
  );
}

// Monthly badge: gold once the user was active on enough days this month, grey before that.
export default function MonthBadge({ label, count, goal }) {
  const earned = count >= goal;
  const hint = earned ? `${label} badge earned` : `Be active on ${goal} days this month to earn the ${label} badge`;
  return (
    <Tooltip title={hint}>
      <Box sx={{ position: 'relative', width: 56, height: 64, flexShrink: 0, filter: earned ? 'none' : 'grayscale(1)', opacity: earned ? 1 : 0.7 }}>
        <HexShape />
        <BadgeLabel label={label} count={count} goal={goal} />
      </Box>
    </Tooltip>
  );
}
