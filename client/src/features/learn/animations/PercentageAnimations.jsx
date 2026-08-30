import { Box, Paper } from '@mui/material';
import { useStepPlayer, AnimationControls } from '../AnimationShell';

function Reveal({ at, step, children }) {
  const visible = step >= at;
  return <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>{children}</g>;
}

/* ------------------------------------------------------------------ */
/* 1. Fraction → Percentage — a 10x10 grid, 3/4 shaded to 75/100        */
/* ------------------------------------------------------------------ */
const GRID_STEPS = 5;
const GRID_COLS = 10;
const GRID_ROWS = 10;
const CELL = 16;
const GRID_X = 60;
const GRID_Y = 20;

export function PercentGridAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(GRID_STEPS);
  // Animate the shaded count from 0 up to 75 as steps progress (step 2 = fully shaded).
  const shadedTarget = step >= 2 ? 75 : 0;

  const cells = [];
  for (let i = 0; i < GRID_COLS * GRID_ROWS; i++) {
    const cx = GRID_X + (i % GRID_COLS) * CELL;
    const cy = GRID_Y + Math.floor(i / GRID_COLS) * CELL;
    cells.push(
      <rect
        key={i}
        x={cx + 1}
        y={cy + 1}
        width={CELL - 2}
        height={CELL - 2}
        rx="2"
        fill={i < shadedTarget ? '#6366f1' : 'currentColor'}
        opacity={i < shadedTarget ? 0.85 : 0.08}
        style={{ transition: 'fill 0.4s ease, opacity 0.4s ease' }}
      />
    );
  }

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 240" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="210" y="14" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              What is 3/4 as a percentage? (100 squares = 100%)
            </text>
          </Reveal>

          {cells}

          <Reveal at={1} step={step}>
            <text x="210" y="200" textAnchor="middle" fontSize="14" fill="currentColor">
              3/4 = 75/100
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="210" y="222" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor">
              3/4 × 100 = 75
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <rect x="160" y="0" width="100" height="20" rx="10" fill="#10b981" opacity="0.15" />
            <text x="210" y="14" textAnchor="middle" fontSize="12" fontWeight="800" fill="#10b981">
              = 75%
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={GRID_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Successive change — +20% then −20%, why it's NOT back to 100      */
/* ------------------------------------------------------------------ */
const SUCC_STEPS = 5;

export function SuccessiveChangeAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(SUCC_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 220" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <rect x="30" y="30" width="80" height="40" rx="6" fill="currentColor" opacity="0.08" />
            <text x="70" y="55" textAnchor="middle" fontSize="16" fontWeight="800" fill="currentColor">
              ₹100
            </text>
            <text x="70" y="85" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.6">
              starting price
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x="150" y="55" fontSize="16" fill="#6366f1">→ +20% →</text>
            <rect x="200" y="30" width="80" height="40" rx="6" fill="#6366f1" opacity="0.12" />
            <text x="240" y="55" textAnchor="middle" fontSize="16" fontWeight="800" fill="#6366f1">
              ₹120
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="290" y="55" fontSize="16" fill="#ef4444">→ −20% →</text>
            <rect x="330" y="30" width="70" height="40" rx="6" fill="#ef4444" opacity="0.12" />
            <text x="365" y="55" textAnchor="middle" fontSize="15" fontWeight="800" fill="#ef4444">
              ₹96
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="210" y="105" textAnchor="middle" fontSize="12" fontWeight="700" fill="#ef4444">
              Not ₹100! The 20% drop was taken on ₹120, not ₹100.
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="210" y="140" textAnchor="middle" fontSize="13" fill="currentColor">
              Net change = 20 + (−20) + (20 × −20)/100
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <rect x="130" y="155" width="160" height="4" fill="currentColor" opacity="0.15" />
            <text x="210" y="185" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--mui-palette-primary-main, #6366f1)">
              Net change = −4%
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={SUCC_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

export const ANIMATION_REGISTRY = {
  percentGrid: PercentGridAnimation,
  successiveChange: SuccessiveChangeAnimation,
};
