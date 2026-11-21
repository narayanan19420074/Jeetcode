import { Box, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ProgressRing from '../../../components/ProgressRing';
import { useLibraryPalette } from '../../dashboard/components/libraryStyle';

const RING_SIZE = 120;
const RING_STROKE = 10;

// Centred completion ring of the Aptitude card. Same neutral track and number colours as the Problems gauge; the arc is the app's primary colour.
export default function AptitudeProgressRing({ value, max, loading = false }) {
  const pal = useLibraryPalette();
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', color: pal.text }}>
      {loading
        ? <Skeleton variant="circular" width={RING_SIZE} height={RING_SIZE} />
        : <ProgressRing value={value} max={max} color={theme.palette.primary.main} mutedColor={pal.muted} size={RING_SIZE} strokeWidth={RING_STROKE} />}
    </Box>
  );
}
