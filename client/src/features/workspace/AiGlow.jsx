import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';

// Full-screen animated outline (the "live assistant" glow): a moving colour sweep that hugs the screen edge.
// Purely decorative: it never captures taps. Respects the reduced-motion setting.
const spin = keyframes`from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); }`;
const SWEEP = 'conic-gradient(from 0deg, #F7A33B, #E8590C, #EC4899, #8B5CF6, #3B82F6, #22D3EE, #F7A33B)';

const ring = (width) => ({
  position: 'absolute',
  inset: 0,
  padding: `${width}px`,
  borderRadius: { xs: '28px', md: '14px' },
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
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
        zIndex: 1350,
        pointerEvents: 'none',
        opacity: active ? 1 : 0,
        transition: 'opacity .45s ease',
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
