import { Box, Paper, Stack, Typography } from '@mui/material';
import { FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';

export default function StatCard({ icon, label, value, hint, color = 'primary.main' }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: RADII_PX.card, height: '100%' }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography variant="h4" sx={{ fontWeight: FONT_WEIGHTS.bold }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
    </Paper>
  );
}
