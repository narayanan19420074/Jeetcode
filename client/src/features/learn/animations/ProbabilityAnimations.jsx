import { Box, Paper } from '@mui/material';
import { useStepPlayer, AnimationControls } from '../AnimationShell';

function Reveal({ at, step, children }) {
  const visible = step >= at;
  return <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>{children}</g>;
}

/* ------------------------------------------------------------------ */
/* 1. Basic probability — Priya's bag: 3 red, 2 blue marbles           */
/* ------------------------------------------------------------------ */
const BASIC_STEPS = 5;
// Fixed layout, 3 red then 2 blue, positioned inside the bag outline.
const MARBLES = [
  { x: 90, cy: 100, color: '#ef4444', favorable: true },
  { x: 140, cy: 100, color: '#3b82f6', favorable: false },
  { x: 190, cy: 100, color: '#ef4444', favorable: true },
  { x: 240, cy: 100, color: '#3b82f6', favorable: false },
  { x: 290, cy: 100, color: '#ef4444', favorable: true },
];

export function BasicProbabilityAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(BASIC_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 220" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <path d="M50 50 h280 v90 a40 40 0 0 1 -40 40 h-200 a40 40 0 0 1 -40 -40 Z" fill="currentColor" opacity="0.05" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
            <text x="210" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">
              Priya's bag — 5 marbles
            </text>
            {MARBLES.map((m, i) => (
              <circle key={i} cx={m.x} cy={m.cy} r="17" fill={m.color} opacity="0.9" />
            ))}
          </Reveal>

          <Reveal at={1} step={step}>
            {MARBLES.filter((m) => m.favorable).map((m, i) => (
              <circle key={i} cx={m.x} cy={m.cy} r="23" fill="none" stroke="#ef4444" strokeWidth="2.5" />
            ))}
            <text x="210" y="165" textAnchor="middle" fontSize="14" fontWeight="700" fill="#ef4444">
              Favorable (red) = 3
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="210" y="188" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor" opacity="0.75">
              Total marbles = 5
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="210" y="212" textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--mui-palette-primary-main, #6366f1)">
              P(red) = 3/5
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <rect x="150" y="0" width="120" height="22" rx="11" fill="#10b981" opacity="0.15" />
            <text x="210" y="15" textAnchor="middle" fontSize="12" fontWeight="800" fill="#10b981">
              = 60% chance
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls
        step={step}
        totalSteps={BASIC_STEPS}
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
/* 2. AND rule — independent events: red marble AND rolling a 6         */
/* ------------------------------------------------------------------ */
const AND_STEPS = 6;

export function AndRuleAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(AND_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 240" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="105" y="24" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ef4444">Pick a marble</text>
            <circle cx="80" cy="55" r="14" fill="#ef4444" />
            <circle cx="110" cy="55" r="14" fill="#3b82f6" />
            <circle cx="140" cy="55" r="14" fill="#ef4444" />

            <text x="330" y="24" textAnchor="middle" fontSize="13" fontWeight="700" fill="#10b981">Roll a die</text>
            <rect x="300" y="42" width="60" height="60" rx="10" fill="#10b981" opacity="0.12" stroke="#10b981" strokeWidth="2" />
            <text x="330" y="80" textAnchor="middle" fontSize="24" fontWeight="800" fill="#10b981">6</text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x="105" y="130" textAnchor="middle" fontSize="16" fontWeight="800" fill="#ef4444">
              P(red) = 3/5
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="330" y="130" textAnchor="middle" fontSize="16" fontWeight="800" fill="#10b981">
              P(6) = 1/6
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="210" y="165" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor" opacity="0.8">
              Independent + happening together → MULTIPLY
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <text x="210" y="195" textAnchor="middle" fontSize="17" fill="currentColor">
              3/5 × 1/6 = 3/30
            </text>
          </Reveal>

          <Reveal at={5} step={step}>
            <rect x="140" y="205" width="140" height="4" fill="currentColor" opacity="0.15" />
            <text x="210" y="230" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--mui-palette-primary-main, #6366f1)">
              P(red AND 6) = 1/10
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls
        step={step}
        totalSteps={AND_STEPS}
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
/* 3. OR rule — mutually exclusive: rolling a 2 or a 5 on one die       */
/* ------------------------------------------------------------------ */
const OR_STEPS = 6;
const DIE_FACES = [1, 2, 3, 4, 5, 6];

export function OrRuleAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(OR_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 220" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="210" y="24" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">
              One die roll — 6 possible faces
            </text>
            {DIE_FACES.map((face, i) => (
              <g key={face}>
                <rect x={40 + i * 58} y="40" width="46" height="46" rx="8" fill="currentColor" opacity="0.06" stroke="currentColor" strokeOpacity="0.25" />
                <text x={40 + i * 58 + 23} y="69" textAnchor="middle" fontSize="18" fontWeight="700" fill="currentColor">
                  {face}
                </text>
              </g>
            ))}
          </Reveal>

          <Reveal at={1} step={step}>
            <rect x={40 + 1 * 58} y="40" width="46" height="46" rx="8" fill="none" stroke="#ef4444" strokeWidth="3" />
            <text x="105" y="115" textAnchor="middle" fontSize="14" fontWeight="700" fill="#ef4444">
              P(2) = 1/6
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <rect x={40 + 4 * 58} y="40" width="46" height="46" rx="8" fill="none" stroke="#10b981" strokeWidth="3" />
            <text x="337" y="115" textAnchor="middle" fontSize="14" fontWeight="700" fill="#10b981">
              P(5) = 1/6
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="210" y="145" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor" opacity="0.8">
              Can't both happen at once → ADD
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <text x="210" y="172" textAnchor="middle" fontSize="17" fill="currentColor">
              1/6 + 1/6 = 2/6
            </text>
          </Reveal>

          <Reveal at={5} step={step}>
            <rect x="150" y="180" width="120" height="4" fill="currentColor" opacity="0.15" />
            <text x="210" y="205" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--mui-palette-primary-main, #6366f1)">
              P(2 OR 5) = 1/3
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls
        step={step}
        totalSteps={OR_STEPS}
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
  basicProbability: BasicProbabilityAnimation,
  andRule: AndRuleAnimation,
  orRule: OrRuleAnimation,
};
