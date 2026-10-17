import { Box, Typography } from '@mui/material';
import { useCountdown } from './contestUtils';

const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };
const pad = (n) => String(n).padStart(2, '0');

export default function Countdown({ targetIso, serverTime, compact = false }) {
  const { d, h, m, s } = useCountdown(targetIso, serverTime);
  const parts = [[d, 'days'], [h, 'hrs'], [m, 'min'], [s, 'sec']];
  return (
    <Box sx={{ display: 'flex', gap: compact ? 1 : 1.5 }} role="timer" aria-label={`Starts in ${d} days ${h} hours ${m} minutes`}>
      {parts.map(([v, label]) => (
        <Box key={label} sx={{ textAlign: 'center', minWidth: compact ? 34 : 48 }}>
          <Typography sx={[{ fontWeight: 800, fontSize: compact ? 18 : 28, lineHeight: 1.1 }, mono]}>{pad(v)}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: compact ? 10 : 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
        </Box>
      ))}
    </Box>
  );
}
