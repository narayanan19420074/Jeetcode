import { Box, CircularProgress, Typography } from '@mui/material';

// Isometric line pattern that fades out towards the middle of the screen.
function LineArt() {
  return (
    <Box component="svg" aria-hidden width="100%" height="55%" sx={{ position: 'absolute', top: 0, left: 0, color: 'primary.main', opacity: 0.45 }}>
      <defs>
        <pattern id="onboarding-lines" width="104" height="120" patternUnits="userSpaceOnUse">
          <path d="M52 0 L104 30 L104 90 L52 120 L0 90 L0 30 Z M52 0 V60 M0 30 L52 60 L104 30" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </pattern>
        <linearGradient id="onboarding-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id="onboarding-mask">
          <rect width="100%" height="100%" fill="url(#onboarding-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#onboarding-lines)" mask="url(#onboarding-mask)" />
    </Box>
  );
}

// Full-screen wait while the personalised plan is being built.
export default function BuildingScreen() {
  return (
    <Box sx={{ position: 'relative', zIndex: 1, minHeight: '100dvh', overflow: 'hidden', bgcolor: 'var(--lib-bg)' }}>
      <LineArt />
      <Box role="status" sx={{ position: 'absolute', top: '58%', left: 0, right: 0, display: 'grid', justifyItems: 'center', gap: 2 }}>
        <CircularProgress size={44} aria-label="Building your plan" />
        <Typography sx={{ color: 'var(--lib-muted)' }}>Building your personalised plan</Typography>
      </Box>
    </Box>
  );
}
