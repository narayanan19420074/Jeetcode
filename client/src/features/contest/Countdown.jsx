import { Box, Typography } from '@mui/material';
import { useCountdown } from './contestUtils';
import { FONTS, FONT_WEIGHTS, FONT_SIZES } from '../../app/design/designTokens';

const mono = { fontFamily: FONTS.mono, fontVariantNumeric: 'tabular-nums' };
const pad = (n) => String(n).padStart(2, '0');

export default function Countdown({ targetIso, serverTime, compact = false }) {
  const { d, h, m, s } = useCountdown(targetIso, serverTime);
  const parts = [[d, 'days'], [h, 'hrs'], [m, 'min'], [s, 'sec']];
  return (
    <Box sx={{ display: 'flex', gap: compact ? 1 : 1.5 }} role="timer" aria-label={`Starts in ${d} days ${h} hours ${m} minutes`}>
      {parts.map(([v, label]) => (
        <Box key={label} sx={{ textAlign: 'center', minWidth: compact ? 34 : 48 }}>
          <Typography sx={[{ fontWeight: FONT_WEIGHTS.bold, fontSize: compact ? FONT_SIZES.subheading : FONT_SIZES.displayLg, lineHeight: 1.1 }, mono]}>{pad(v)}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: compact ? FONT_SIZES.micro : FONT_SIZES.micro, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
        </Box>
      ))}
    </Box>
  );
}
