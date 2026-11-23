import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';

const ICON_COLOR_STEP = 500;

// A filter: its icon and name on one line, the operator and the choice under it. Used by the filter cards of the Problems
// and Store pages. `color` is a COLOR_PALETTE hue.
export default function FilterRow({ icon: Icon, color, label, hint, children }) {
  return (
    <Tooltip title={hint ?? ''}>
      <Box sx={{ display: 'grid', gap: 0.75 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Icon sx={{ fontSize: FONT_SIZES.heading, color: color[ICON_COLOR_STEP] }} />
          <Typography component="span" sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.semibold }}>{label}</Typography>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: 1 }}>{children}</Box>
      </Box>
    </Tooltip>
  );
}
