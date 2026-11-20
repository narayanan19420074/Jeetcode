import { Box, Skeleton } from '@mui/material';
import ProgressRing from '../../../../components/ProgressRing';
import { LIGHT_CARD_MUTED_OPACITY } from './lightCardStyles';

const RING_SIZE = 88;
const RING_STROKE = 10;

// Centred completion ring for the white cards: it draws in the card's blue and shows "value / max" in its middle.
export default function LightCardRing({ value, max, loading = false }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
      {loading
        ? <Skeleton variant="circular" width={RING_SIZE} height={RING_SIZE} sx={{ opacity: LIGHT_CARD_MUTED_OPACITY }} />
        : <ProgressRing value={value} max={max} color="currentColor" mutedColor="inherit" size={RING_SIZE} strokeWidth={RING_STROKE} />}
    </Box>
  );
}
