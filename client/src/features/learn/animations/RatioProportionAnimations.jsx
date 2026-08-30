import { Box, Paper } from '@mui/material';
import { useStepPlayer, AnimationControls } from '../AnimationShell';

function Reveal({ at, step, children }) {
  const visible = step >= at;
  return <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>{children}</g>;
}

/* ------------------------------------------------------------------ */
/* 1. Dividing a quantity in a ratio — ₹5000 split 3:2                  */
/* ------------------------------------------------------------------ */
const DIVIDE_STEPS = 6;

export function DividingRatioAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(DIVIDE_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 220" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="210" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">
              Profit ₹5000, invested in ratio 3:2
            </text>
            <rect x="130" y="30" width="160" height="36" rx="6" fill="currentColor" opacity="0.08" />
            <text x="210" y="53" textAnchor="middle" fontSize="16" fontWeight="800" fill="currentColor">₹5000</text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x="210" y="90" textAnchor="middle" fontSize="13" fill="currentColor">
              Total parts = 3 + 2 = 5
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="210" y="115" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--mui-palette-primary-main, #6366f1)">
              Value per part = 5000 ÷ 5 = ₹1000
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <rect x="40" y="140" width="150" height="40" rx="8" fill="#6366f1" opacity="0.12" />
            <text x="115" y="158" textAnchor="middle" fontSize="12" fontWeight="700" fill="#6366f1">Arjun (3 parts)</text>
            <text x="115" y="175" textAnchor="middle" fontSize="15" fontWeight="800" fill="#6366f1">₹3000</text>
          </Reveal>

          <Reveal at={4} step={step}>
            <rect x="230" y="140" width="150" height="40" rx="8" fill="#10b981" opacity="0.12" />
            <text x="305" y="158" textAnchor="middle" fontSize="12" fontWeight="700" fill="#10b981">Kumar (2 parts)</text>
            <text x="305" y="175" textAnchor="middle" fontSize="15" fontWeight="800" fill="#10b981">₹2000</text>
          </Reveal>

          <Reveal at={5} step={step}>
            <text x="210" y="205" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" opacity="0.75">
              Check: 3000 + 2000 = ₹5000 ✓
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={DIVIDE_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Solving a proportion — 4:6 :: 10:x, cross multiplication          */
/* ------------------------------------------------------------------ */
const PROP_STEPS = 5;

export function ProportionSolveAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(PROP_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 220" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="210" y="30" textAnchor="middle" fontSize="18" fontWeight="800" fill="currentColor">
              4 : 6  ::  10 : x
            </text>
            <text x="210" y="52" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.7">
              Find x
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <path d="M150 65 L 270 100" stroke="#6366f1" strokeWidth="2" fill="none" />
            <path d="M270 65 L 150 100" stroke="#10b981" strokeWidth="2" fill="none" />
            <text x="210" y="120" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              Cross multiply
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="210" y="150" textAnchor="middle" fontSize="16" fill="currentColor">
              4 × x = 6 × 10
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="210" y="175" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">
              4x = 60
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <rect x="160" y="185" width="100" height="4" fill="currentColor" opacity="0.15" />
            <text x="210" y="210" textAnchor="middle" fontSize="20" fontWeight="800" fill="#10b981">
              x = 15
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={PROP_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Compound ratio — A:B=2:3 and B:C=4:5, combine into A:B:C          */
/* ------------------------------------------------------------------ */
const COMPOUND_STEPS = 5;

export function CompoundRatioAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(COMPOUND_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 240" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="210" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">
              A:B = 2:3   and   B:C = 4:5
            </text>
            <text x="210" y="40" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.7">
              Find A:B:C
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x="210" y="68" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--mui-palette-primary-main, #6366f1)">
              Make B match: LCM(3, 4) = 12
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <rect x="40" y="85" width="150" height="40" rx="8" fill="#6366f1" opacity="0.12" />
            <text x="115" y="103" textAnchor="middle" fontSize="12" fontWeight="700" fill="#6366f1">A:B = 2:3 (×4)</text>
            <text x="115" y="120" textAnchor="middle" fontSize="15" fontWeight="800" fill="#6366f1">= 8 : 12</text>
          </Reveal>

          <Reveal at={3} step={step}>
            <rect x="230" y="85" width="150" height="40" rx="8" fill="#10b981" opacity="0.12" />
            <text x="305" y="103" textAnchor="middle" fontSize="12" fontWeight="700" fill="#10b981">B:C = 4:5 (×3)</text>
            <text x="305" y="120" textAnchor="middle" fontSize="15" fontWeight="800" fill="#10b981">= 12 : 15</text>
          </Reveal>

          <Reveal at={4} step={step}>
            <rect x="90" y="150" width="240" height="4" fill="currentColor" opacity="0.15" />
            <text x="210" y="185" textAnchor="middle" fontSize="20" fontWeight="800" fill="currentColor">
              A : B : C = 8 : 12 : 15
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={COMPOUND_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

export const ANIMATION_REGISTRY = {
  dividingRatio: DividingRatioAnimation,
  proportionSolve: ProportionSolveAnimation,
  compoundRatio: CompoundRatioAnimation,
};
