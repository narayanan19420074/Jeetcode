import { Paper } from '@mui/material';
import { RADII_PX } from '../../../app/design/designTokens';

// White outlined card used in the left and right rails of the desktop Community page.
export default function RailCard({ children, sx }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: RADII_PX.card, bgcolor: 'background.paper', overflow: 'hidden', ...sx }}>
      {children}
    </Paper>
  );
}
