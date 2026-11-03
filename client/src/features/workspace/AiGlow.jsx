import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { COLOR_PALETTE, RADII_PX, Z_INDEX, MOTION } from '../../app/design/designTokens';

// Full-screen animated outline (the "live assistant" glow): a moving colour sweep that hugs the screen edge.
// Purely decorative: it never captures taps. Respects the reduced-motion setting.
const spin = keyframes`from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); }`;
const SWEEP = `conic-gradient(from 0deg, ${COLOR_PALETTE.custom.orangeF7A33B}, ${COLOR_PALETTE.orange[600]}, ${COLOR_PALETTE.pink[500]}, ${COLOR_PALETTE.violet[500]}, ${COLOR_PALETTE.blue[500]}, ${COLOR_PALETTE.cyan[400]}, ${COLOR_PALETTE.custom.orangeF7A33B})`;

const ring = (width) => ({
  position: 'absolute',
  inset: 0,
  padding: `${width}px`,
  borderRadius: { xs: RADII_PX.card, md: RADII_PX.card },
  WebkitMask: `linear-gradient(${COLOR_PALETTE.black} 0 0) content-box, linear-gradient(${COLOR_PALETTE.black} 0 0)`,
  WebkitMaskComposite: 'xor',
  mask: `linear-gradient(${COLOR_PALETTE.black} 0 0) content-box, linear-gradient(${COLOR_PALETTE.black} 0 0)`,
  maskComposite: 'exclude',
  overflow: 'hidden',
});

export default function AiGlow({ active, intensity = 1 }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: Z_INDEX.aiGlow,
        pointerEvents: 'none',
        opacity: active ? 1 : 0,
        transition: `opacity ${MOTION.deliberate}ms ease`,
        '@media (prefers-reduced-motion: reduce)': { '& .jc-sweep': { animation: 'none !important' } },
      }}
    >
      {/* soft outer glow */}
      <Box sx={{ ...ring(10), filter: 'blur(14px)', opacity: 0.75 * intensity }}>
        <Box className="jc-sweep" sx={{ position: 'absolute', top: '50%', left: '50%', width: '300vmax', height: '300vmax', background: SWEEP, animation: `${spin} 4s linear infinite` }} />
      </Box>
      {/* crisp edge line */}
      <Box sx={ring(3)}>
        <Box className="jc-sweep" sx={{ position: 'absolute', top: '50%', left: '50%', width: '300vmax', height: '300vmax', background: SWEEP, animation: `${spin} 4s linear infinite` }} />
      </Box>
    </Box>
  );
}
