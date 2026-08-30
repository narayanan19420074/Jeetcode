import { Box, Paper } from '@mui/material';
import { useStepPlayer, AnimationControls } from '../AnimationShell';

function Reveal({ at, step, children }) {
  const visible = step >= at;
  return <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>{children}</g>;
}

/* ------------------------------------------------------------------ */
/* 1. Speed basics + unit conversion — 150km in 3hr, convert to m/s     */
/* ------------------------------------------------------------------ */
const SPEED_STEPS = 5;

export function SpeedBasicsAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(SPEED_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 210" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="210" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">
              Kavya travels 150 km in 3 hours
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x="210" y="55" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--mui-palette-primary-main, #6366f1)">
              Speed = 150 ÷ 3 = 50 km/h
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="210" y="90" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.8">
              Convert to m/s: multiply by 5/18
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="210" y="120" textAnchor="middle" fontSize="14" fill="currentColor">
              50 × 5/18 = 250/18
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <rect x="140" y="135" width="140" height="4" fill="currentColor" opacity="0.15" />
            <text x="210" y="165" textAnchor="middle" fontSize="19" fontWeight="800" fill="#10b981">
              ≈ 13.9 m/s
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={SPEED_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Relative speed — same direction (subtract) vs opposite (add)      */
/* ------------------------------------------------------------------ */
const REL_STEPS = 4;

export function RelativeSpeedAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(REL_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 220" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="210" y="18" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              Train A = 60 km/h, Train B = 40 km/h
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x="210" y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill="#6366f1">
              Same direction (→ →)
            </text>
            <path d="M60 65 L140 65" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrow1)" />
            <path d="M240 65 L300 65" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrow1)" />
            <defs>
              <marker id="arrow1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#6366f1" />
              </marker>
            </defs>
            <text x="210" y="90" textAnchor="middle" fontSize="14" fontWeight="800" fill="#6366f1">
              Relative speed = 60 − 40 = 20 km/h
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="210" y="130" textAnchor="middle" fontSize="12" fontWeight="700" fill="#10b981">
              Opposite direction (→ ←)
            </text>
            <path d="M60 145 L140 145" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow2)" />
            <path d="M300 145 L240 145" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow2)" />
            <defs>
              <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#10b981" />
              </marker>
            </defs>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="210" y="175" textAnchor="middle" fontSize="14" fontWeight="800" fill="#10b981">
              Relative speed = 60 + 40 = 100 km/h
            </text>
            <text x="210" y="200" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.7">
              Same → subtract. Opposite → add.
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={REL_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Train crossing a point (pole) vs a platform                       */
/* ------------------------------------------------------------------ */
const CROSS_STEPS = 5;

export function TrainCrossingAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(CROSS_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 230" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="210" y="18" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              Train length = 150m, speed = 54 km/h = 15 m/s
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <rect x="80" y="35" width="90" height="24" rx="4" fill="#6366f1" opacity="0.6" />
            <line x1="260" y1="47" x2="260" y2="47" stroke="currentColor" strokeWidth="4" />
            <circle cx="260" cy="47" r="4" fill="currentColor" />
            <text x="210" y="80" textAnchor="middle" fontSize="12" fontWeight="700" fill="#6366f1">
              Crossing a POLE: distance = train length only = 150m
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="210" y="105" textAnchor="middle" fontSize="14" fontWeight="800" fill="#6366f1">
              Time = 150 ÷ 15 = 10 sec
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <rect x="80" y="125" width="90" height="24" rx="4" fill="#10b981" opacity="0.6" />
            <rect x="220" y="125" width="140" height="24" rx="4" fill="currentColor" opacity="0.08" />
            <text x="290" y="141" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">platform 250m</text>
            <text x="210" y="170" textAnchor="middle" fontSize="12" fontWeight="700" fill="#10b981">
              Crossing a PLATFORM: distance = 150 + 250 = 400m
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <rect x="130" y="185" width="160" height="4" fill="currentColor" opacity="0.15" />
            <text x="210" y="212" textAnchor="middle" fontSize="16" fontWeight="800" fill="#10b981">
              Time = 400 ÷ 15 ≈ 26.7 sec
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={CROSS_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

export const ANIMATION_REGISTRY = {
  speedBasics: SpeedBasicsAnimation,
  relativeSpeed: RelativeSpeedAnimation,
  trainCrossing: TrainCrossingAnimation,
};
