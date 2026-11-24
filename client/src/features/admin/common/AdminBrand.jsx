import { Box, Typography } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { FONT_WEIGHTS } from '../../../app/design/designTokens';

// Product name in the admin top bar (desktop) and the admin header (phone).
export default function AdminBrand() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CodeRoundedIcon sx={{ color: 'primary.main' }} />
      <Typography variant="h6" sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: '-0.02em' }}>
        Jeet <Box component="span" sx={{ color: 'primary.main' }}>Code</Box>
      </Typography>
    </Box>
  );
}
