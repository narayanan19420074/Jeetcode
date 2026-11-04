import { Box } from '@mui/material';
import { SIZES, Z_INDEX } from '../../app/design/designTokens';
import { PrimaryCta } from './HomeCommon';
import { hairline } from './homeStyles';

// Phone-only bar that keeps the main action in reach while neither the hero nor the closing button is on screen.
export default function StickyCta({ label, onClick }) {
  return (
    <Box
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: Z_INDEX.dock,
        p: 1.5,
        pb: 'calc(12px + env(safe-area-inset-bottom))',
        bgcolor: 'background.paper',
        borderTop: hairline,
        borderColor: 'divider',
      }}
    >
      <PrimaryCta label={label} onClick={onClick} sx={{ width: SIZES.fill }} />
    </Box>
  );
}
