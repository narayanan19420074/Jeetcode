import { Box } from '@mui/material';
import { useStepPlayer, AnimationControls } from '../../AnimationShell';
import { COLOR_PALETTE, withAlpha, FONT_SIZES, FONT_WEIGHTS, RADII_PX, MOTION } from '../../../../app/design/designTokens';

// Fixed brand colors — visible on both light and dark backgrounds.
export const COLORS = {
  primary: COLOR_PALETTE.blue[500],
  primarySoft: withAlpha(COLOR_PALETTE.blue[500], 0.15),
  success: COLOR_PALETTE.emerald[500],
  successSoft: withAlpha(COLOR_PALETTE.emerald[500], 0.15),
  danger: COLOR_PALETTE.red[500],
  dangerSoft: withAlpha(COLOR_PALETTE.red[500], 0.12),
  amber: COLOR_PALETTE.amber[500],
  amberSoft: withAlpha(COLOR_PALETTE.amber[500], 0.15),
};

const SVG_WRAP = { width: '100%', maxWidth: 560, mx: 'auto' };

// All neutral text uses `currentColor`, inheriting from the parent Box's
// text color. This makes the visuals render correctly in both light and
// dark mode without any explicit theme-aware color logic.
export function Reveal({ at, step, children, delay = 0 }) {
  const visible = step >= at;
  return (
    <g
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: `opacity ${MOTION.slow}ms ease ${delay}ms, transform ${MOTION.slow}ms ease ${delay}ms`,
      }}
    >
      {children}
    </g>
  );
}

export function VisualFrame({ steps, children, title }) {
  const { step, playing, next, prev, reset, togglePlay, skipToEnd } = useStepPlayer(steps, 1800, true);
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: RADII_PX.card,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        color: 'text.primary',  // <- drives currentColor for all SVG text
      }}
    >
      {title && (
        <Box sx={{ mb: 1 }}>
          <Box
            component="span"
            sx={{
              fontSize: FONT_SIZES.micro,
              fontWeight: FONT_WEIGHTS.bold,
              letterSpacing: '0.08em',
              color: 'primary.main',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Box>
        </Box>
      )}
      <Box sx={SVG_WRAP}>
        <svg viewBox="0 0 560 280" width="100%" style={{ display: 'block' }}>
          {typeof children === 'function' ? children(step) : children}
        </svg>
      </Box>
      <AnimationControls
        step={step}
        totalSteps={steps}
        playing={playing}
        onPrev={prev}
        onNext={next}
        onSkipToEnd={skipToEnd}
        onTogglePlay={togglePlay}
        onReset={reset}
      />
    </Box>
  );
}
