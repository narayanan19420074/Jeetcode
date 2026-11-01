import { Box, LinearProgress } from '@mui/material';
import BrandMark from '../../../components/BrandMark';

// Brand mark and a thin progress bar above the cards.
export default function TopBar({ progress }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 2, maxWidth: 640, width: '100%', mx: 'auto' }}>
      <BrandMark size={32} />
      <LinearProgress
        variant="determinate"
        value={Math.min(progress, 1) * 100}
        aria-label="Onboarding progress"
        sx={{ flex: 1, height: 4, borderRadius: 999, bgcolor: 'var(--lib-divider)' }}
      />
    </Box>
  );
}
