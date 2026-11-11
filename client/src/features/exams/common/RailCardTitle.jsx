import { Typography } from '@mui/material';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';

// Heading of the Upcoming and Your preparation cards.
export default function RailCardTitle({ children }) {
  return <Typography component="h2" sx={{ mb: 1.5, fontSize: FONT_SIZES.subheading, fontWeight: FONT_WEIGHTS.bold }}>{children}</Typography>;
}
