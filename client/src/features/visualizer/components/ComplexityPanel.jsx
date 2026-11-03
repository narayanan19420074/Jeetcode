import { Paper, Typography, Box, Chip, Divider, Stack } from '@mui/material';
import { FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';

export default function ComplexityPanel({ algo, opsCount, description }) {
  return (
    <Paper data-teach="complexity" variant="outlined" sx={{ p: 3, borderRadius: RADII_PX.card }}>
      <Typography variant="subtitle1" sx={{ fontWeight: FONT_WEIGHTS.bold, mb: 0.5 }}>{algo.name}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{algo.description}</Typography>

      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Chip label={`Best: ${algo.best}`} size="small" variant="outlined" color="success" />
        <Chip label={`Average: ${algo.average}`} size="small" variant="outlined" color="warning" />
        <Chip label={`Worst: ${algo.worst}`} size="small" variant="outlined" color="error" />
        <Chip label={`Space: ${algo.space}`} size="small" variant="outlined" />
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: FONT_WEIGHTS.bold, letterSpacing: '0.05em' }}>
        Live counters
      </Typography>
      <Box data-teach="counters" sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
        {Object.entries(opsCount || {}).map(([key, value]) => (
          <Chip key={key} label={`${key}: ${value}`} size="small" sx={{ fontFamily: (t) => t.typography.monospace.fontFamily, fontWeight: FONT_WEIGHTS.bold }} />
        ))}
      </Box>

      {description && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" sx={{ fontFamily: (t) => t.typography.monospace.fontFamily }}>{description}</Typography>
        </>
      )}
    </Paper>
  );
}
