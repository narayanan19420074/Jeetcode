import { Box, Paper, Typography } from '@mui/material';
import { FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const TILE_TINT = 0.14;

// Soft square behind the icon, like the learner category cards. The tint is drawn from the icon's own colour
// (currentColor), so any palette colour passed in `color` works in light and dark mode.
const iconTileSx = (color) => ({
  position: 'relative',
  width: SIZES.iconButton.mobile,
  height: SIZES.iconButton.mobile,
  borderRadius: RADII_PX.card,
  display: 'grid',
  placeItems: 'center',
  color,
  '&::before': { content: '""', position: 'absolute', inset: 0, borderRadius: 'inherit', bgcolor: 'currentColor', opacity: TILE_TINT },
});

export default function StatCard({ icon, label, value, hint, color = 'primary.main' }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: RADII_PX.card, height: SIZES.fill, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box aria-hidden sx={iconTileSx(color)}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: FONT_WEIGHTS.bold }}>
          {value}
        </Typography>
        {hint && (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
