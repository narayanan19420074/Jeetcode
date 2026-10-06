import { Box, CircularProgress, Typography } from '@mui/material';

// Determinate progress ring with a centred label (hub progress, results score).
export default function Ring({ value, size = 120, thickness = 4.5, color = 'primary.main', label, sublabel }) {
  const pct = Math.min(100, Math.max(0, value || 0));
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <CircularProgress variant="determinate" value={100} size={size} thickness={thickness} sx={{ color: 'action.hover' }} />
      <CircularProgress
        variant="determinate"
        value={pct}
        size={size}
        thickness={thickness}
        sx={{ color, position: 'absolute', left: 0, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
      />
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', lineHeight: 1, fontSize: size * 0.24 }}>
          {label}
        </Typography>
        {sublabel && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.4, fontSize: Math.max(10, size * 0.09) }}>
            {sublabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
