import { Box, Paper } from '@mui/material';
import { useStepPlayer, AnimationControls } from '../AnimationShell';

function Reveal({ at, step, children }) {
  const visible = step >= at;
  return (
    <g style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0px)' : 'translateY(6px)', transition: 'opacity 0.45s ease, transform 0.45s ease' }}>
      {children}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Shared cartoon pieces — a small flat-illustration "kit" reused      */
/* across every scene so the topic feels like one consistent world.    */
/* ------------------------------------------------------------------ */

// A friendly little person. `mood`: 'happy' | 'thinking' | 'excited' | 'sad'.
// `color` tints the shirt; everything else stays on-brand neutral tones.
function Buddy({ x = 0, y = 0, scale = 1, color = '#6366f1', mood = 'happy', label }) {
  const mouth = {
    happy: 'M -6 5 Q 0 10 6 5',
    excited: 'M -7 4 Q 0 13 7 4',
    thinking: 'M -5 6 L 5 6',
    sad: 'M -6 8 Q 0 3 6 8',
  }[mood];

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* body */}
      <rect x={-14} y={6} width={28} height={26} rx={10} fill={color} />
      {/* head */}
      <circle cx={0} cy={-8} r={16} fill="#FBCFA0" />
      {/* hair */}
      <path d="M -16 -12 Q -16 -26 0 -26 Q 16 -26 16 -12 Q 10 -18 0 -18 Q -10 -18 -16 -12 Z" fill="#3a2a1e" />
      {/* eyes */}
      <circle cx={-6} cy={-8} r={1.8} fill="#1f2937" />
      <circle cx={6} cy={-8} r={1.8} fill="#1f2937" />
      {/* blush */}
      <circle cx={-10} cy={-2} r={2.2} fill="#f4a3a3" opacity="0.6" />
      <circle cx={10} cy={-2} r={2.2} fill="#f4a3a3" opacity="0.6" />
      {/* mouth */}
      <path d={mouth} stroke="#1f2937" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      {mood === 'thinking' && (
        <g>
          <circle cx={18} cy={-24} r={2} fill="currentColor" opacity="0.35" />
          <circle cx={23} cy={-29} r={2.6} fill="currentColor" opacity="0.35" />
          <text x={30} y={-27} fontSize="12" fill="currentColor" opacity="0.6">?</text>
        </g>
      )}
      {label && (
        <text x={0} y={44} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="currentColor" opacity="0.8">
          {label}
        </text>
      )}
    </g>
  );
}

function CricketBat({ x = 0, y = 0, rotate = -20 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x={-3} y={-24} width={6} height={22} rx={2} fill="#d9a066" />
      <rect x={-4} y={-2} width={8} height={16} rx={3} fill="#b97a3f" />
    </g>
  );
}

function ScoreBar({ x, label, h, color = '#6366f1', highlight }) {
  return (
    <g>
      <rect x={x} y={130 - h} width={30} height={h} rx={8} fill={color} opacity={highlight ? 1 : 0.75} />
      <text x={x + 15} y={130 - h - 8} textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor">
        {label}
      </text>
    </g>
  );
}

function Sparkle({ x, y, size = 10, color = '#f59e0b' }) {
  return (
    <path
      d={`M ${x} ${y - size} L ${x + size * 0.28} ${y - size * 0.28} L ${x + size} ${y} L ${x + size * 0.28} ${y + size * 0.28} L ${x} ${y + size} L ${x - size * 0.28} ${y + size * 0.28} L ${x - size} ${y} L ${x - size * 0.28} ${y - size * 0.28} Z`}
      fill={color}
      opacity="0.85"
    />
  );
}

/* ------------------------------------------------------------------ */
/* 1. Based on equation — Arjun's 3 known scores, find the 4th          */
/* ------------------------------------------------------------------ */
const EQ_STEPS = 6;

export function EquationBasedAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(EQ_STEPS);
  const bars = [
    { label: '40', h: 40, x: 40 },
    { label: '50', h: 50, x: 85 },
    { label: '60', h: 60, x: 130 },
  ];

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 230" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <Buddy x={100} y={150} scale={0.85} mood="happy" />
            <CricketBat x={122} y={150} />
            <text x="100" y="14" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor">
              Arjun's first 3 match scores
            </text>
            {bars.map((b) => (
              <ScoreBar key={b.label} x={b.x} label={b.label} h={b.h} color="#6366f1" />
            ))}
          </Reveal>

          <Reveal at={1} step={step}>
            <text x="100" y="175" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">
              Sum = 40 + 50 + 60 = 150
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="100" y="197" textAnchor="middle" fontSize="14" fontWeight="800" fill="#6366f1">
              Average = 150 ÷ 3 = 50
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <line x1="220" y1="10" x2="220" y2="210" stroke="currentColor" strokeOpacity="0.12" />
            <Buddy x={330} y={70} scale={0.75} mood="thinking" />
            <text x="330" y="112" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              4th match: unknown score
            </text>
            <text x="330" y="128" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.75">
              Target average (4 matches) = 45
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <text x="330" y="155" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">
              Required sum = 45 × 4 = 180
            </text>
          </Reveal>

          <Reveal at={5} step={step}>
            <Sparkle x={280} y="200" size={7} />
            <Sparkle x={385} y="195" size={5} color="#10b981" />
            <text x="330" y="180" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.8">
              180 − 150 = 30
            </text>
            <text x="330" y="205" textAnchor="middle" fontSize="16" fontWeight="800" fill="#10b981">
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
  const toX = (v) => 40 + ((v - 30) / 40) * 340;

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 230" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <line x1="40" y1="55" x2="380" y2="55" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" />
            {[40, 50, 60].map((v) => (
              <g key={v}>
                <circle cx={toX(v)} cy="55" r="7" fill="#6366f1" />
                <text x={toX(v)} y="38" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor">{v}</text>
              </g>
            ))}
          </Reveal>

          <Reveal at={1} step={step}>
            <text x={toX(40)} y="80" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.7">min</text>
            <text x={toX(60)} y="80" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.7">max</text>
          </Reveal>

          <Reveal at={2} step={step}>
            <line x1={toX(40)} y1="55" x2={toX(60)} y2="55" stroke="#10b981" strokeWidth="5" strokeLinecap="round" opacity="0.55" />
            <Buddy x="210" y="115" scale={0.7} mood="happy" />
            <text x="210" y="150" textAnchor="middle" fontSize="12" fontWeight="700" fill="#10b981">
              Average must live in here
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="60" y="180" fontSize="12.5" fill="currentColor">"Average could be 65"</text>
            <text x="330" y="180" fontSize="15" fontWeight="800" fill="#ef4444">FALSE</text>
          </Reveal>

          <Reveal at={4} step={step}>
            <text x="60" y="202" fontSize="12.5" fill="currentColor">"Average could be 45"</text>
            <text x="330" y="202" fontSize="15" fontWeight="800" fill="#10b981">TRUE</text>
          </Reveal>

          <Reveal at={5} step={step}>
            <text x="210" y="222" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="currentColor" opacity="0.8">
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
  const positions = [50, 105, 160, 215, 270];

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 240" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="160" y="16" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor">
              Group of 5 — average age 30
            </text>
            {positions.map((x, i) => (
              <Buddy key={i} x={x} y="55" scale={0.5} mood="happy" color={i === 0 ? '#6366f1' : '#94a3b8'} />
            ))}
            <text x="160" y="105" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.75">
              Total = 30 × 5 = 150
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <circle cx={positions[0]} cy="52" r="26" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4 3" />
            <text x={positions[0]} y="130" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ef4444">
              leaves (age 22)
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="160" y="155" textAnchor="middle" fontSize="12" fill="currentColor">
              Remaining 4 total = 150 − 22 = 128
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <Buddy x={positions[0]} y="55" scale={0.5} mood="excited" color="#10b981" />
            <text x={positions[0]} y="180" textAnchor="middle" fontSize="11" fontWeight="700" fill="#10b981">
              new person joins
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <text x="160" y="200" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor">
              New average (5 people) = 32 → new total = 160
            </text>
          </Reveal>

          <Reveal at={5} step={step}>
            <Sparkle x={370} y="55" size={9} />
            <text x="160" y="225" textAnchor="middle" fontSize="15" fontWeight="800" fill="#10b981">
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
        <svg viewBox="0 0 420 230" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <rect x="30" y="20" width="210" height="75" rx="14" fill="#6366f1" opacity="0.08" stroke="#6366f1" strokeWidth="1.5" />
            {[0, 1, 2].map((i) => (
              <Buddy key={i} x={65 + i * 45} y="60" scale={0.4} mood="happy" color="#6366f1" />
            ))}
            <text x="135" y="45" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor">
              20 students · avg 60 marks
            </text>
            <text x="135" y="88" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.6">
              total = 60 × 20 = 1200
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <Buddy x={300} y="55" scale={0.55} mood="excited" color="#10b981" />
            <path d="M255 55 L280 55" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrow)" />
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#10b981" />
              </marker>
            </defs>
            <text x="345" y="60" fontSize="12.5" fontWeight="700" fill="#10b981">
              +1 joins
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <rect x="30" y="115" width="230" height="70" rx="14" fill="#10b981" opacity="0.08" stroke="#10b981" strokeWidth="1.5" />
            <text x="145" y="140" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor">
              21 students now
            </text>
            <text x="145" y="160" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.75">
              new average = 61 marks
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="145" y="178" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.6">
              new total = 61 × 21 = 1281
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <Sparkle x={330} y="150" size={8} />
            <text x="145" y="215" textAnchor="middle" fontSize="14" fontWeight="800" fill="#10b981">
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
/* 5. Average speed — the same-distance trap: 30 kmph / 50 kmph         */
/* ------------------------------------------------------------------ */
const SPEED_STEPS = 6;

function ToyCar({ x, y, color = '#6366f1' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-16} y={-8} width={32} height={12} rx={4} fill={color} />
      <rect x={-9} y={-15} width={18} height={9} rx={3} fill={color} opacity="0.8" />
      <circle cx={-9} cy={5} r={4} fill="#1f2937" />
      <circle cx={9} cy={5} r={4} fill="#1f2937" />
    </g>
  );
}

export function AverageSpeedAnimation() {
  const { step, playing, next, prev, reset, togglePlay } = useStepPlayer(SPEED_STEPS);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
        <svg viewBox="0 0 420 240" width="100%" style={{ display: 'block' }}>
          <Reveal at={0} step={step}>
            <text x="210" y="16" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor">
              Same 120 km route, both ways
            </text>
            <line x1="40" y1="45" x2="380" y2="45" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" />
            <text x="40" y="35" fontSize="11" fill="currentColor" opacity="0.7">A</text>
            <text x="380" y="35" fontSize="11" fill="currentColor" opacity="0.7">B</text>
            <ToyCar x={130} y={45} color="#6366f1" />
            <text x="210" y="70" textAnchor="middle" fontSize="12.5" fill="#6366f1" fontWeight="700">
              Going: 30 km/h
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <ToyCar x={290} y={45} color="#10b981" />
            <text x="210" y="90" textAnchor="middle" fontSize="12.5" fill="#10b981" fontWeight="700">
              Returning: 50 km/h
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x="210" y="116" textAnchor="middle" fontSize="12.5" fill="#ef4444" textDecoration="line-through" opacity="0.8">
              Tempting guess: (30+50)/2 = 40 km/h
            </text>
            <text x="210" y="132" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ef4444">
              ✗ Wrong — more TIME is spent at the slower speed
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x="210" y="158" textAnchor="middle" fontSize="12.5" fill="currentColor">
              Time going = 120/30 = 4h · Time returning = 120/50 = 2.4h
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <text x="210" y="180" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="currentColor">
              Total distance = 240 km · Total time = 6.4h
            </text>
          </Reveal>

          <Reveal at={5} step={step}>
            <Sparkle x={130} y="205" size={7} />
            <Sparkle x={290} y="200" size={5} color="#10b981" />
            <text x="210" y="215" textAnchor="middle" fontSize="17" fontWeight="800" fill="#10b981">
              Average speed = 240/6.4 = 37.5 km/h
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
