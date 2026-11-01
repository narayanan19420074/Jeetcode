import { Box } from '@mui/material';

const STREAKS = 'repeating-linear-gradient(78deg, rgba(247,163,59,0.55) 0 7%, rgba(255,255,255,0) 7% 12%, rgba(239,108,77,0.40) 12% 18%, rgba(255,255,255,0) 18% 24%)';

const drift = {
  '@keyframes auroraDrift': {
    from: { transform: 'skewY(-14deg) translateX(-4%)' },
    to: { transform: 'skewY(-14deg) translateX(4%)' },
  },
  animation: 'auroraDrift 12s ease-in-out infinite alternate',
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
};

// Soft moving colour streaks behind the cards. Decorative only, so it is hidden from assistive tech.
// It is bold on the welcome screen and fades to a faint tint behind the question cards.
export default function AuroraBackground({ isStrong }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: isStrong ? 0.9 : 0.35,
        transition: 'opacity 0.8s ease',
      }}
    >
      <Box sx={{ position: 'absolute', left: '-25%', right: '-25%', top: '22%', height: '58%', background: STREAKS, filter: 'blur(34px)', ...drift }} />
    </Box>
  );
}
