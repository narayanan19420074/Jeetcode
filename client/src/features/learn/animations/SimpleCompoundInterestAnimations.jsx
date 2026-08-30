import { Box, Paper } from '@mui/material';
import { useStepPlayer, AnimationControls } from '../AnimationShell';

function Reveal({ at, step, children }) {
  const visible = step >= at;
  return <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>{children}</g>;
}

/* ------------------------------------------------------------------ */
/* 1. SI basics — P=5000, R=8%, T=3 years                               */
/* ------------------------------------------------------------------ */
const SI_STEPS = 5;

export function SiBasicAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(SI_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 210" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="210" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">
              P = ₹5000, R = 8% p.a., T = 3 years
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x="210" y="55" textAnchor="middle" fontSize="15" fill="currentColor">
              SI = (P × R × T) ÷ 100
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="210" y="85" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--mui-palette-primary-main, #6366f1)">
              = (5000 × 8 × 3) ÷ 100 = ₹1200
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <rect x="60" y="105" width="130" height="36" rx="6" fill="currentColor" opacity="0.08" />
            <text x="125" y="127" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">Principal</text>
            <rect x="230" y="105" width="130" height="36" rx="6" fill="#6366f1" opacity="0.12" />
            <text x="295" y="127" textAnchor="middle" fontSize="12" fontWeight="700" fill="#6366f1">+ Interest</text>
          </Reveal>

          <Reveal at={4} step={step}>
            <rect x="130" y="155" width="160" height="4" fill="currentColor" opacity="0.15" />
            <text x="210" y="185" textAnchor="middle" fontSize="19" fontWeight="800" fill="#10b981">
              Total amount = ₹6200
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={SI_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* 2. CI year-by-year growth — P=5000, R=10%, 3 years                   */
/* ------------------------------------------------------------------ */
const CI_STEPS = 5;

export function CiGrowthAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(CI_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 220" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="210" y="18" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              P = ₹5000, R = 10% p.a., compounded annually
            </text>
            <rect x="20" y="30" width="90" height="32" rx="6" fill="currentColor" opacity="0.08" />
            <text x="65" y="51" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">₹5000</text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x="130" y="50" fontSize="14" fill="#6366f1">→ +10% →</text>
            <rect x="200" y="30" width="90" height="32" rx="6" fill="#6366f1" opacity="0.12" />
            <text x="245" y="51" textAnchor="middle" fontSize="12" fontWeight="700" fill="#6366f1">₹5500</text>
            <text x="245" y="75" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">Year 1</text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="310" y="50" fontSize="14" fill="#10b981">→ +10% →</text>
            <rect x="20" y="90" width="90" height="32" rx="6" fill="#10b981" opacity="0.12" />
            <text x="65" y="111" textAnchor="middle" fontSize="12" fontWeight="700" fill="#10b981">₹6050</text>
            <text x="65" y="132" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">Year 2 (on ₹5500, not ₹5000!)</text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="130" y="110" fontSize="14" fill="#f59e0b">→ +10% →</text>
            <rect x="200" y="90" width="90" height="32" rx="6" fill="#f59e0b" opacity="0.15" />
            <text x="245" y="111" textAnchor="middle" fontSize="12" fontWeight="700" fill="#f59e0b">₹6655</text>
            <text x="245" y="132" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">Year 3</text>
          </Reveal>

          <Reveal at={4} step={step}>
            <rect x="80" y="150" width="260" height="4" fill="currentColor" opacity="0.15" />
            <text x="210" y="180" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--mui-palette-primary-main, #6366f1)">
              CI = 6655 − 5000 = ₹1655
            </text>
            <text x="210" y="200" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.7">
              (SI would\'ve been only ₹1500 — extra ₹155 is "interest on interest")
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={CI_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* 3. SI vs CI 2-year difference shortcut — P=8000, R=5%                */
/* ------------------------------------------------------------------ */
const DIFF_STEPS = 5;

export function SiCiDifferenceAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(DIFF_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 210" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="210" y="18" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              P = ₹8000, R = 5%, T = 2 years
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <rect x="50" y="30" width="140" height="34" rx="6" fill="currentColor" opacity="0.08" />
            <text x="120" y="52" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">SI = ₹800</text>
          </Reveal>

          <Reveal at={2} step={step}>
            <rect x="230" y="30" width="140" height="34" rx="6" fill="#6366f1" opacity="0.12" />
            <text x="300" y="52" textAnchor="middle" fontSize="13" fontWeight="700" fill="#6366f1">CI = ₹820</text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="210" y="100" textAnchor="middle" fontSize="14" fontWeight="700" fill="#10b981">
              Difference = 820 − 800 = ₹20
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <rect x="90" y="120" width="240" height="4" fill="currentColor" opacity="0.15" />
            <text x="210" y="150" textAnchor="middle" fontSize="14" fill="currentColor">
              Shortcut: P×(R/100)² = 8000×(0.05)²
            </text>
            <text x="210" y="175" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--mui-palette-primary-main, #6366f1)">
              = ₹20 ✓ matches!
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={DIFF_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

export const ANIMATION_REGISTRY = {
  siBasic: SiBasicAnimation,
  ciGrowth: CiGrowthAnimation,
  siCiDifference: SiCiDifferenceAnimation,
};
