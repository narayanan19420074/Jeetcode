import { Box, Typography } from '@mui/material';
import ScreenTransition from './ScreenTransition';

// Welcome screen shown for a moment before the first question.
export default function IntroScreen() {
  return (
    <Box sx={{ position: 'relative', zIndex: 1, minHeight: '100dvh', display: 'grid', placeItems: 'center', px: 3 }}>
      <ScreenTransition maxWidth={520}>
        <Typography component="h1" sx={{ textAlign: 'center', fontSize: { xs: 32, sm: 40 }, fontWeight: 500, lineHeight: 1.2 }}>
          Let&apos;s{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            start your journey
          </Box>
        </Typography>
      </ScreenTransition>
    </Box>
  );
}
