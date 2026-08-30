import { Box, Paper, Typography } from '@mui/material';
import { useStepPlayer, AnimationControls } from '../AnimationShell';

function Reveal({ at, step, children }) {
  const visible = step >= at;
  return <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>{children}</g>;
}

// A simple "wall" rendered as a grid of bricks, with a fraction of them
// tinted to show how much of the job is done. Shared visual language
// across all 3 animations so the story stays visually consistent.
function WallProgress({ x, y, w, h, fraction, color, cols = 6, rows = 3 }) {
  const cellW = w / cols;
  const cellH = h / rows;
  const totalCells = cols * rows;
  const filledCells = Math.round(fraction * totalCells);
  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const cx = x + (i % cols) * cellW;
    const cy = y + Math.floor(i / cols) * cellH;
    cells.push(
      <rect
        key={i}
        x={cx + 1}
        y={cy + 1}
        width={cellW - 2}
        height={cellH - 2}
        rx="2"
        fill={i < filledCells ? color : 'currentColor'}
        opacity={i < filledCells ? 0.85 : 0.08}
        style={{ transition: 'fill 0.4s ease, opacity 0.4s ease' }}
      />
    );
  }
  return <>{cells}</>;
}

/* ------------------------------------------------------------------ */
/* 1. One worker's efficiency — Ravi paints alone, 1/6 per day         */
/* ------------------------------------------------------------------ */
const EFFICIENCY_STEPS = 6;

export function WorkerEfficiencyAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(EFFICIENCY_STEPS);
  const dayLabels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'];
  const currentDay = Math.min(step, 5);
  const fraction = step === 0 ? 0 : (currentDay + 1) / 6;

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Ravi paints this wall alone in 6 days
      </Typography>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 220" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <rect x="30" y="20" width="240" height="120" rx="4" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
            <WallProgress x={30} y={20} w={240} h={120} fraction={step === 0 ? 0 : fraction} color="#6366f1" />
          </Reveal>

          <Reveal at={0} step={step}>
            <text x="150" y="160" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">
              {step === 0 ? 'Starting fresh' : dayLabels[currentDay]}
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x="330" y="60" fontSize="14" fontWeight="700" fill="#6366f1">Each day:</text>
            <text x="330" y="82" fontSize="22" fontWeight="800" fill="#6366f1">+ 1/6</text>
            <text x="330" y="100" fontSize="11" fill="currentColor" opacity="0.6">of the wall</text>
          </Reveal>

          <Reveal at={5} step={step}>
            <text x="150" y="190" textAnchor="middle" fontSize="16" fontWeight="800" fill="#10b981">
              Wall complete — 6/6
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls
        step={step}
        totalSteps={EFFICIENCY_STEPS}
        playing={playing}
        onPrev={prev}
        onNext={next}
        onTogglePlay={togglePlay}
        onReset={reset}
      />
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Combined work — Ravi (1/6) + Kumar (1/8) working together        */
/* ------------------------------------------------------------------ */
const COMBINED_STEPS = 5;

export function CombinedWorkAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(COMBINED_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 260" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="20" y="20" fontSize="13" fontWeight="700" fill="#6366f1">Ravi</text>
            <rect x="20" y="28" width="160" height="16" rx="4" fill="currentColor" opacity="0.08" />
            <rect x="20" y="28" width="26.7" height="16" rx="4" fill="#6366f1" />
            <text x="190" y="41" fontSize="12" fill="currentColor" opacity="0.7">1/6 per day</text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x="20" y="66" fontSize="13" fontWeight="700" fill="#10b981">Kumar</text>
            <rect x="20" y="74" width="160" height="16" rx="4" fill="currentColor" opacity="0.08" />
            <rect x="20" y="74" width="20" height="16" rx="4" fill="#10b981" />
            <text x="190" y="87" fontSize="12" fill="currentColor" opacity="0.7">1/8 per day</text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="20" y="120" fontSize="13" fontWeight="700" fill="currentColor">Together, each day:</text>
            <text x="20" y="148" fontSize="18" fill="currentColor">1/6 + 1/8 = 4/24 + 3/24</text>
          </Reveal>

          <Reveal at={3} step={step}>
            <rect x="20" y="160" width="200" height="4" fill="currentColor" opacity="0.15" />
            <text x="20" y="188" fontSize="22" fontWeight="800" fill="var(--mui-palette-primary-main, #6366f1)">
              = 7/24 per day
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <text x="20" y="225" fontSize="16" fontWeight="700" fill="currentColor">
              Whole wall (24/24) takes:
            </text>
            <text x="20" y="250" fontSize="22" fontWeight="800" fill="#10b981">
              24 ÷ 7 ≈ 3.43 days
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls
        step={step}
        totalSteps={COMBINED_STEPS}
        playing={playing}
        onPrev={prev}
        onNext={next}
        onTogglePlay={togglePlay}
        onReset={reset}
      />
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* 3. LCM shortcut — assume total work = LCM(6, 8) = 24 units           */
/* ------------------------------------------------------------------ */
const LCM_WORK_STEPS = 5;

export function LcmShortcutWorkAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(LCM_WORK_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 240" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="210" y="24" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor">
              Assume total work = LCM(6, 8)
            </text>
            <text x="210" y="50" textAnchor="middle" fontSize="24" fontWeight="800" fill="var(--mui-palette-primary-main, #6366f1)">
              24 units
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <rect x="30" y="70" width="160" height="40" rx="8" fill="#6366f1" opacity="0.12" />
            <text x="110" y="95" textAnchor="middle" fontSize="14" fontWeight="700" fill="#6366f1">
              Ravi: 24 ÷ 6 = 4/day
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <rect x="230" y="70" width="160" height="40" rx="8" fill="#10b981" opacity="0.12" />
            <text x="310" y="95" textAnchor="middle" fontSize="14" fontWeight="700" fill="#10b981">
              Kumar: 24 ÷ 8 = 3/day
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="210" y="145" textAnchor="middle" fontSize="16" fill="currentColor">
              Combined = 4 + 3 = 7 units/day
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <rect x="90" y="160" width="240" height="4" fill="currentColor" opacity="0.15" />
            <text x="210" y="190" textAnchor="middle" fontSize="15" fill="currentColor">
              Days needed = 24 ÷ 7
            </text>
            <text x="210" y="218" textAnchor="middle" fontSize="22" fontWeight="800" fill="#10b981">
              = 24/7 days (same answer!)
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls
        step={step}
        totalSteps={LCM_WORK_STEPS}
        playing={playing}
        onPrev={prev}
        onNext={next}
        onTogglePlay={togglePlay}
        onReset={reset}
      />
    </Paper>
  );
}

export const ANIMATION_REGISTRY = {
  workerEfficiency: WorkerEfficiencyAnimation,
  combinedWork: CombinedWorkAnimation,
  lcmShortcutWork: LcmShortcutWorkAnimation,
};
