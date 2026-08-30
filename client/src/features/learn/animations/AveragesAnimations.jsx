import { Box, Paper } from '@mui/material';
import { useStepPlayer, AnimationControls } from '../AnimationShell';

function Reveal({ at, step, children }) {
  const visible = step >= at;
  return <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>{children}</g>;
}

/* ------------------------------------------------------------------ */
/* 1. Based on equation — Arjun's 3 known scores, find the 4th          */
/* ------------------------------------------------------------------ */
const EQ_STEPS = 6;

export function EquationBasedAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(EQ_STEPS);
  const bars = [
    { label: '40', h: 40, x: 50 },
    { label: '50', h: 50, x: 100 },
    { label: '60', h: 60, x: 150 },
  ];

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 230" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="120" y="20" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              Arjun's first 3 match scores
            </text>
            {bars.map((b) => (
              <g key={b.label}>
                <rect x={b.x} y={130 - b.h} width="30" height={b.h} rx="4" fill="#6366f1" opacity="0.7" />
                <text x={b.x + 15} y="145" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
                  {b.label}
                </text>
              </g>
            ))}
          </Reveal>

          <Reveal at={1} step={step}>
            <text x="120" y="170" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor">
              Sum = 40 + 50 + 60 = 150
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="120" y="195" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--mui-palette-primary-main, #6366f1)">
              Average = 150 ÷ 3 = 50
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <line x1="230" y1="10" x2="230" y2="210" stroke="currentColor" strokeOpacity="0.15" />
            <text x="330" y="30" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              4th match: unknown score
            </text>
            <text x="330" y="52" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.75">
              Target average (4 matches) = 45
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <text x="330" y="90" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor">
              Required sum = 45 × 4 = 180
            </text>
          </Reveal>

          <Reveal at={5} step={step}>
            <rect x="270" y="105" width="120" height="4" fill="currentColor" opacity="0.15" />
            <text x="330" y="135" textAnchor="middle" fontSize="14" fill="currentColor">
              180 − 150 = 30
            </text>
            <text x="330" y="160" textAnchor="middle" fontSize="17" fontWeight="800" fill="#10b981">
              4th match score = 30
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={EQ_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* 2. True/False reading — average always between min and max           */
/* ------------------------------------------------------------------ */
const TF_STEPS = 6;

export function TrueFalseReadingAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(TF_STEPS);
  // Number line from 30 to 70, values at 40, 50, 60 (avg 50)
  const toX = (v) => 30 + ((v - 30) / 40) * 360;

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 220" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <line x1="30" y1="60" x2="390" y2="60" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
            {[40, 50, 60].map((v) => (
              <g key={v}>
                <circle cx={toX(v)} cy="60" r="6" fill="#6366f1" />
                <text x={toX(v)} y="45" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">{v}</text>
              </g>
            ))}
          </Reveal>

          <Reveal at={1} step={step}>
            <text x={toX(40)} y="82" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.7">min</text>
            <text x={toX(60)} y="82" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.7">max</text>
          </Reveal>

          <Reveal at={2} step={step}>
            <line x1={toX(40)} y1="60" x2={toX(60)} y2="60" stroke="#10b981" strokeWidth="4" opacity="0.5" />
            <text x="210" y="105" textAnchor="middle" fontSize="12" fontWeight="700" fill="#10b981">
              Average must fall in here
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="60" y="140" fontSize="13" fill="currentColor">"Average could be 65"</text>
            <text x="330" y="140" fontSize="16" fontWeight="800" fill="#ef4444">FALSE</text>
            <text x="330" y="155" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">(65 &gt; max 60)</text>
          </Reveal>

          <Reveal at={4} step={step}>
            <text x="60" y="180" fontSize="13" fill="currentColor">"Average could be 45"</text>
            <text x="330" y="180" fontSize="16" fontWeight="800" fill="#10b981">TRUE</text>
            <text x="330" y="195" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">(between 40–60)</text>
          </Reveal>

          <Reveal at={5} step={step}>
            <text x="210" y="215" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" opacity="0.8">
              Check the boundary first, before calculating
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={TF_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Replacing a person — group of 5, avg 30, one member swapped       */
/* ------------------------------------------------------------------ */
const REPLACE_STEPS = 6;

export function ReplacingPersonAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(REPLACE_STEPS);
  const positions = [50, 110, 170, 230, 290];

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 230" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="170" y="20" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              Group of 5 — average age 30
            </text>
            {positions.map((x, i) => (
              <circle key={i} cx={x} cy="55" r="16" fill="#6366f1" opacity="0.7" />
            ))}
            <text x="170" y="90" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.75">
              Total = 30 × 5 = 150
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <circle cx={positions[0]} cy="55" r="20" fill="none" stroke="#ef4444" strokeWidth="3" />
            <text x={positions[0]} y="115" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ef4444">
              leaves (age 22)
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="170" y="140" textAnchor="middle" fontSize="12" fill="currentColor">
              Remaining 4 total = 150 − 22 = 128
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <circle cx={positions[0]} cy="55" r="16" fill="#10b981" opacity="0.85" />
            <text x={positions[0]} y="165" textAnchor="middle" fontSize="11" fontWeight="700" fill="#10b981">
              new person joins
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <text x="170" y="185" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              New average (5 people) = 32 → new total = 160
            </text>
          </Reveal>

          <Reveal at={5} step={step}>
            <rect x="90" y="195" width="160" height="4" fill="currentColor" opacity="0.15" />
            <text x="170" y="220" textAnchor="middle" fontSize="16" fontWeight="800" fill="#10b981">
              New person's age = 160 − 128 = 32
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={REPLACE_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Including & excluding — a new student joins a class of 20         */
/* ------------------------------------------------------------------ */
const INCL_STEPS = 5;

export function IncludingExcludingAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(INCL_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 220" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <rect x="30" y="20" width="200" height="70" rx="8" fill="#6366f1" opacity="0.1" stroke="#6366f1" strokeWidth="1.5" />
            <text x="130" y="45" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              20 students
            </text>
            <text x="130" y="65" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.75">
              average = 60 marks
            </text>
            <text x="130" y="82" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.6">
              total = 60 × 20 = 1200
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <path d="M250 40 L290 40 L290 30 L310 55 L290 80 L290 70 L250 70 Z" fill="#10b981" opacity="0.6" />
            <text x="360" y="60" fontSize="13" fontWeight="700" fill="#10b981">
              +1 joins
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <rect x="30" y="110" width="220" height="70" rx="8" fill="#10b981" opacity="0.1" stroke="#10b981" strokeWidth="1.5" />
            <text x="140" y="135" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              21 students now
            </text>
            <text x="140" y="155" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.75">
              new average = 61 marks
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="140" y="175" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.6">
              new total = 61 × 21 = 1281
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <rect x="30" y="192" width="220" height="4" fill="currentColor" opacity="0.15" />
            <text x="140" y="215" textAnchor="middle" fontSize="15" fontWeight="800" fill="#10b981">
              New student's marks = 1281 − 1200 = 81
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={INCL_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Average speed — the same-distance trap: 40 kmph / 60 kmph         */
/* ------------------------------------------------------------------ */
const SPEED_STEPS = 6;

export function AverageSpeedAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(SPEED_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 240" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="210" y="20" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              Same 120 km route, both ways
            </text>
            <line x1="40" y1="45" x2="380" y2="45" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
            <text x="40" y="38" fontSize="11" fill="currentColor" opacity="0.7">A</text>
            <text x="380" y="38" fontSize="11" fill="currentColor" opacity="0.7">B</text>
            <text x="210" y="65" textAnchor="middle" fontSize="12" fill="#6366f1" fontWeight="700">
              Going: 40 km/h
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x="210" y="85" textAnchor="middle" fontSize="12" fill="#10b981" fontWeight="700">
              Returning: 60 km/h
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="210" y="112" textAnchor="middle" fontSize="13" fill="#ef4444" textDecoration="line-through" opacity="0.8">
              Tempting guess: (40+60)/2 = 50 km/h
            </text>
            <text x="210" y="128" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ef4444">
              ✗ Wrong — more TIME is spent at the slower speed
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="210" y="153" textAnchor="middle" fontSize="13" fill="currentColor">
              Time going = 120/40 = 3h · Time returning = 120/60 = 2h
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <text x="210" y="176" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">
              Total distance = 240 km · Total time = 5h
            </text>
          </Reveal>

          <Reveal at={5} step={step}>
            <rect x="130" y="188" width="160" height="4" fill="currentColor" opacity="0.15" />
            <text x="210" y="215" textAnchor="middle" fontSize="18" fontWeight="800" fill="#10b981">
              Average speed = 240/5 = 48 km/h
            </text>
          </Reveal>
        </svg>
      </Box>
      <AnimationControls step={step} totalSteps={SPEED_STEPS} playing={playing} onPrev={prev} onNext={next} onTogglePlay={togglePlay} onReset={reset} />
    </Paper>
  );
}

export const ANIMATION_REGISTRY = {
  equationBased: EquationBasedAnimation,
  trueFalseReading: TrueFalseReadingAnimation,
  replacingPerson: ReplacingPersonAnimation,
  includingExcluding: IncludingExcludingAnimation,
  averageSpeed: AverageSpeedAnimation,
};
