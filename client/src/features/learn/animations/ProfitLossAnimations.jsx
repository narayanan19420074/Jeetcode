import { Box, Paper } from '@mui/material';
import { useStepPlayer, AnimationControls } from '../AnimationShell';

function Reveal({ at, step, children }) {
  const visible = step >= at;
  return <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>{children}</g>;
}

/* ------------------------------------------------------------------ */
/* 1. Profit % basics — Meena buys 8000, sells 9200                     */
/* ------------------------------------------------------------------ */
const BASIC_STEPS = 5;

export function ProfitLossBasicAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(BASIC_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 210" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <rect x="40" y="20" width="140" height="40" rx="8" fill="currentColor" opacity="0.08" />
            <text x="110" y="38" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">CP (bought for)</text>
            <text x="110" y="55" textAnchor="middle" fontSize="15" fontWeight="800" fill="currentColor">₹8000</text>
          </Reveal>

          <Reveal at={1} step={step}>
            <rect x="240" y="20" width="140" height="40" rx="8" fill="#6366f1" opacity="0.12" />
            <text x="310" y="38" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6366f1">SP (sold for)</text>
            <text x="310" y="55" textAnchor="middle" fontSize="15" fontWeight="800" fill="#6366f1">₹9200</text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="210" y="95" textAnchor="middle" fontSize="14" fontWeight="700" fill="#10b981">
              Profit = SP − CP = 9200 − 8000 = ₹1200
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="210" y="125" textAnchor="middle" fontSize="13" fill="currentColor">
              Profit % = (Profit ÷ CP) × 100
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <rect x="130" y="140" width="160" height="4" fill="currentColor" opacity="0.15" />
            <text x="210" y="170" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--mui-palette-primary-main, #6366f1)">
              = 1200/8000 × 100 = 15%
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={BASIC_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Marked price → discount → SP → profit chain                       */
/* ------------------------------------------------------------------ */
const MP_STEPS = 5;

export function MarkedPriceDiscountAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(MP_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 230" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="210" y="20" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              Marked Price (MP) = ₹10,000
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x="210" y="48" textAnchor="middle" fontSize="13" fill="#ef4444">
              Discount 20% → −₹2000
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <rect x="130" y="60" width="160" height="34" rx="6" fill="#6366f1" opacity="0.12" />
            <text x="210" y="82" textAnchor="middle" fontSize="15" fontWeight="800" fill="#6366f1">
              SP = ₹8000
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="210" y="120" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.8">
              Given: CP = ₹6000
            </text>
            <text x="210" y="140" textAnchor="middle" fontSize="13" fontWeight="700" fill="#10b981">
              Profit = SP − CP = 8000 − 6000 = ₹2000
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <rect x="130" y="155" width="160" height="4" fill="currentColor" opacity="0.15" />
            <text x="210" y="185" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--mui-palette-primary-main, #6366f1)">
              Profit % = 2000/6000×100 ≈ 33.3%
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={MP_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* 3. False weight trick — 900g given for a claimed 1000g/1kg           */
/* ------------------------------------------------------------------ */
const WEIGHT_STEPS = 5;

export function FalseWeightAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(WEIGHT_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 220" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="210" y="20" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              "I sell at cost price — no profit!"
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <rect x="60" y="35" width="130" height="46" rx="8" fill="currentColor" opacity="0.08" />
            <text x="125" y="55" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">Claims to give</text>
            <text x="125" y="73" textAnchor="middle" fontSize="15" fontWeight="800" fill="currentColor">1000 g</text>

            <rect x="230" y="35" width="130" height="46" rx="8" fill="#ef4444" opacity="0.12" />
            <text x="295" y="55" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ef4444">Actually gives</text>
            <text x="295" y="73" textAnchor="middle" fontSize="15" fontWeight="800" fill="#ef4444">900 g</text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="210" y="110" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">
              He charged for 1000g but only spent 900g worth
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="210" y="140" textAnchor="middle" fontSize="13" fill="currentColor">
              Profit% = (True − False)/False × 100
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <rect x="130" y="150" width="160" height="4" fill="currentColor" opacity="0.15" />
            <text x="210" y="180" textAnchor="middle" fontSize="19" fontWeight="800" fill="#10b981">
              = (1000−900)/900×100 ≈ 11.1%
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={WEIGHT_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

export const ANIMATION_REGISTRY = {
  profitLossBasic: ProfitLossBasicAnimation,
  markedPriceDiscount: MarkedPriceDiscountAnimation,
  falseWeight: FalseWeightAnimation,
};
