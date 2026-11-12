import { Box, Stack, Typography } from '@mui/material';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../../../app/design/designTokens';

const ruleSx = { flex: 1, borderTop: '1px solid var(--lib-divider)' };

// The date line between two days of messages: a label in the middle of a thin rule.
export default function DayDivider({ label }) {
  return (
    <Stack role="separator" aria-label={label} direction="row" sx={{ alignItems: 'center', gap: 2, mt: 3 }}>
      <Box sx={ruleSx} />
      <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lib-muted)' }}>{label}</Typography>
      <Box sx={ruleSx} />
    </Stack>
  );
}
