import { Box } from '@mui/material';
import { useStepPlayer, AnimationControls } from '../AnimationShell';

// Fixed brand colors — visible on both light and dark backgrounds.
const COLORS = {
  primary: '#3b82f6',
  primarySoft: 'rgba(59,130,246,0.15)',
  success: '#10b981',
  successSoft: 'rgba(16,185,129,0.15)',
  danger: '#ef4444',
  dangerSoft: 'rgba(239,68,68,0.12)',
  amber: '#f59e0b',
  amberSoft: 'rgba(245,158,11,0.15)',
};

const SVG_WRAP = { width: '100%', maxWidth: 560, mx: 'auto' };

// All neutral text uses `currentColor`, inheriting from the parent Box's
// text color. This makes the visuals render correctly in both light and
// dark mode without any explicit theme-aware color logic.
function Reveal({ at, step, children, delay = 0 }) {
  const visible = step >= at;
  return (
    <g
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
      }}
    >
      {children}
    </g>
  );
}

function VisualFrame({ steps, children, title }) {
  const { step, playing, next, prev, reset, togglePlay, skipToEnd } = useStepPlayer(steps, 1800, true);
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        color: 'text.primary',  // <- drives currentColor for all SVG text
      }}
    >
      {title && (
        <Box sx={{ mb: 1 }}>
          <Box
            component="span"
            sx={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'primary.main',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Box>
        </Box>
      )}
      <Box sx={SVG_WRAP}>
        <svg viewBox="0 0 560 280" width="100%" style={{ display: 'block' }}>
          {typeof children === 'function' ? children(step) : children}
        </svg>
      </Box>
      <AnimationControls
        step={step}
        totalSteps={steps}
        playing={playing}
        onPrev={prev}
        onNext={next}
        onSkipToEnd={skipToEnd}
        onTogglePlay={togglePlay}
        onReset={reset}
      />
    </Box>
  );
}

/* ================================================================ */
/* 1. Bar chart with average line                                     */
/* ================================================================ */
function BarAverageVisual() {
  const bars = [
    { v: 40, x: 80 },
    { v: 50, x: 170 },
    { v: 60, x: 260 },
  ];

  return (
    <VisualFrame steps={5} title="Average = Sum ÷ Count">
      {(step) => (
        <>
          {/* Step 0: title + axes baseline so it's never empty */}
          <Reveal at={0} step={step}>
            <text x={280} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">
              Arjun&apos;s first 3 scores
            </text>
            <line x1={40} y1={200} x2={520} y2={200} stroke="currentColor" strokeOpacity={0.25} strokeWidth={1.5} />
          </Reveal>

          {bars.map((b, i) => (
            <Reveal key={i} at={0} step={step} delay={(i + 1) * 120}>
              <rect x={b.x} y={200 - b.v * 1.8} width={60} height={b.v * 1.8} rx={6} fill={COLORS.primary} opacity={0.85} />
              <text x={b.x + 30} y={200 - b.v * 1.8 - 8} textAnchor="middle" fontSize={13} fontWeight={800} fill={COLORS.primary}>
                {b.v}
              </text>
            </Reveal>
          ))}

          <Reveal at={1} step={step}>
            <text x={280} y={230} textAnchor="middle" fontSize={13} fill="currentColor">
              Sum = 40 + 50 + 60 = <tspan fontWeight={800}>150</tspan>
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x={280} y={252} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.7}>
              Count = 3
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <line x1={40} y1={200 - 50 * 1.8} x2={520} y2={200 - 50 * 1.8} stroke={COLORS.success} strokeWidth={2} strokeDasharray="6 4" />
            <text x={530} y={200 - 50 * 1.8 + 4} textAnchor="end" fontSize={11} fontWeight={700} fill={COLORS.success}>
              Average = 50
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <text x={280} y={274} textAnchor="middle" fontSize={14} fontWeight={800} fill={COLORS.success}>
              Average = 150 ÷ 3 = 50
            </text>
          </Reveal>
        </>
      )}
    </VisualFrame>
  );
}

/* ================================================================ */
/* 2. Number line — find missing value                                */
/* ================================================================ */
function MissingLineVisual() {
  const known = [10, 15, 20, 25];
  const positions = (v) => 60 + (v / 40) * 440;

  return (
    <VisualFrame steps={6} title="Sum = Average × Count">
      {(step) => (
        <>
          {/* Step 0: full setup — title, number line, empty marker for the unknown */}
          <Reveal at={0} step={step}>
            <text x={280} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">
              Average of 5 numbers = 18
            </text>
            <line x1={40} y1={100} x2={520} y2={100} stroke="currentColor" strokeOpacity={0.25} strokeWidth={2} />
            <text x={40} y={92} fontSize={10} fill="currentColor" opacity={0.6}>0</text>
            <text x={520} y={92} fontSize={10} fill="currentColor" opacity={0.6}>40</text>
            {/* 5 slot markers — the last one is the unknown */}
            {[0, 1, 2, 3, 4].map((i) => (
              <circle
                key={i}
                cx={80 + i * 95}
                cy={100}
                r={i === 4 ? 11 : 5}
                fill={i === 4 ? 'none' : 'currentColor'}
                stroke={i === 4 ? COLORS.amber : 'none'}
                strokeWidth={i === 4 ? 2.5 : 0}
                strokeDasharray={i === 4 ? '4 3' : undefined}
                opacity={i === 4 ? 1 : 0.35}
              />
            ))}
            <text x={460} y={130} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLORS.amber}>
              ?
            </text>
          </Reveal>

          {known.map((v, i) => (
            <Reveal key={i} at={1} step={step} delay={i * 100}>
              <circle cx={positions(v)} cy={100} r={9} fill={COLORS.primary} />
              <text x={positions(v)} y={80} textAnchor="middle" fontSize={12} fontWeight={800} fill={COLORS.primary}>
                {v}
              </text>
            </Reveal>
          ))}

          <Reveal at={2} step={step}>
            <text x={280} y={155} textAnchor="middle" fontSize={13} fill="currentColor">
              Known sum = 10 + 15 + 20 + 25 = <tspan fontWeight={800}>70</tspan>
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x={280} y={178} textAnchor="middle" fontSize={13} fill="currentColor">
              Required sum = 18 × 5 = <tspan fontWeight={800}>90</tspan>
            </text>
          </Reveal>

          <Reveal at={4} step={step}>
            <line x1={positions(20)} y1={130} x2={positions(20)} y2={100} stroke={COLORS.amber} strokeWidth={2} markerEnd="url(#aArrow)" />
            <defs>
              <marker id="aArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={COLORS.amber} />
              </marker>
            </defs>
            <circle cx={positions(20)} cy={100} r={9} fill="none" stroke={COLORS.amber} strokeWidth={3} strokeDasharray="4 3" />
          </Reveal>

          <Reveal at={5} step={step}>
            <text x={280} y={225} textAnchor="middle" fontSize={15} fontWeight={800} fill={COLORS.success}>
              Missing = 90 − 70 = 20
            </text>
          </Reveal>
        </>
      )}
    </VisualFrame>
  );
}

/* ================================================================ */
/* 3. Triad triangle (Sum / Count / Average)                          */
/* ================================================================ */
function TriadTriangleVisual() {
  return (
    <VisualFrame steps={3} title="Know two, find the third">
      {(step) => (
        <>
          <Reveal at={0} step={step}>
            <polygon points="280,40 480,240 80,240" fill="none" stroke={COLORS.primary} strokeWidth={2} />
            <text x={280} y={72} textAnchor="middle" fontSize={16} fontWeight={800} fill={COLORS.primary}>Sum</text>
            <text x={80} y={262} textAnchor="middle" fontSize={16} fontWeight={800} fill={COLORS.primary}>Count</text>
            <text x={480} y={262} textAnchor="middle" fontSize={16} fontWeight={800} fill={COLORS.primary}>Average</text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x={170} y={180} fontSize={12} fontWeight={700} fill="currentColor" opacity={0.7}>Sum ÷ Count</text>
            <text x={390} y={180} fontSize={12} fontWeight={700} fill="currentColor" opacity={0.7}>Sum ÷ Average</text>
            <text x={280} y={150} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor" opacity={0.7}>Average × Count</text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x={280} y={278} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.75}>
              Any two known → third is computable
            </text>
          </Reveal>
        </>
      )}
    </VisualFrame>
  );
}

/* ================================================================ */
/* 4. Consecutive dots                                                */
/* ================================================================ */
function ConsecutiveDotsVisual() {
  return (
    <VisualFrame steps={4} title="Evenly-spaced → middle term = average">
      {(step) => (
        <>
          <Reveal at={0} step={step}>
            <line x1={60} y1={120} x2={500} y2={120} stroke="currentColor" strokeOpacity={0.25} strokeWidth={2} />
            {[40, 45, 50, 55, 60].map((v, i) => (
              <g key={v}>
                <circle cx={80 + i * 100} cy={120} r={12} fill={COLORS.primary} opacity={0.85} />
                <text x={80 + i * 100} y={150} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">
                  {v}
                </text>
              </g>
            ))}
          </Reveal>

          <Reveal at={1} step={step}>
            <circle cx={80 + 2 * 100} cy={120} r={20} fill="none" stroke={COLORS.success} strokeWidth={3} />
            <text x={280} y={90} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS.success}>
              Middle = Average = 50
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x={280} y={200} textAnchor="middle" fontSize={13} fill="currentColor">
              Sum = Average × Count = 50 × 5 = <tspan fontWeight={800}>250</tspan>
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x={280} y={235} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.7}>
              No addition needed — read the middle
            </text>
          </Reveal>
        </>
      )}
    </VisualFrame>
  );
}

/* ================================================================ */
/* 5. Series sum formula                                              */
/* ================================================================ */
function SeriesSumVisual() {
  return (
    <VisualFrame steps={3} title="Series shortcuts">
      {(step) => (
        <>
          <Reveal at={0} step={step}>
            <text x={280} y={60} textAnchor="middle" fontSize={14} fontWeight={800} fill={COLORS.primary}>First n naturals</text>
            <text x={280} y={88} textAnchor="middle" fontSize={14} fontFamily="monospace" fill="currentColor">n (n+1) / 2</text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x={280} y={145} textAnchor="middle" fontSize={14} fontWeight={800} fill={COLORS.success}>First n odd</text>
            <text x={280} y={173} textAnchor="middle" fontSize={14} fontFamily="monospace" fill="currentColor">n²</text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x={280} y={230} textAnchor="middle" fontSize={14} fontWeight={800} fill={COLORS.amber}>First n even</text>
            <text x={280} y={258} textAnchor="middle" fontSize={14} fontFamily="monospace" fill="currentColor">n (n+1)</text>
          </Reveal>
        </>
      )}
    </VisualFrame>
  );
}

/* ================================================================ */
/* 6. Member added                                                    */
/* ================================================================ */
function MemberAddedVisual() {
  return (
    <VisualFrame steps={4} title="New member = New Avg + (Old Count × Δavg)">
      {(step) => (
        <>
          <Reveal at={0} step={step}>
            <text x={280} y={28} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">
              20 students · average 60
            </text>
            <rect x={60} y={120} width={420} height={120} rx={10} fill={COLORS.primarySoft} stroke={COLORS.primary} strokeWidth={1.5} />
            <text x={280} y={185} textAnchor="middle" fontSize={14} fontWeight={800} fill={COLORS.primary}>
              Total = 60 × 20 = 1200
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <rect x={60} y={120} width={420} height={120} rx={10} fill={COLORS.successSoft} stroke={COLORS.success} strokeWidth={1.5} />
            <text x={280} y={185} textAnchor="middle" fontSize={14} fontWeight={800} fill={COLORS.success}>
              Now 21 students · average 61
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x={280} y={70} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.75}>
              New total = 61 × 21 = 1281
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x={280} y={268} textAnchor="middle" fontSize={15} fontWeight={800} fill={COLORS.success}>
              New student = 1281 − 1200 = 81
            </text>
          </Reveal>
        </>
      )}
    </VisualFrame>
  );
}

/* ================================================================ */
/* 7. Member removed                                                  */
/* ================================================================ */
function MemberRemovedVisual() {
  return (
    <VisualFrame steps={4} title="Removed = Old Total − New Total">
      {(step) => (
        <>
          <Reveal at={0} step={step}>
            <text x={280} y={28} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">
              5 numbers · average 27
            </text>
            <rect x={60} y={100} width={420} height={100} rx={10} fill={COLORS.primarySoft} stroke={COLORS.primary} strokeWidth={1.5} />
            <text x={280} y={157} textAnchor="middle" fontSize={14} fontWeight={800} fill={COLORS.primary}>
              Total = 27 × 5 = 135
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x={280} y={228} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.75}>
              After removal → 4 numbers · average 25
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x={280} y={250} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.75}>
              New total = 25 × 4 = 100
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x={280} y={274} textAnchor="middle" fontSize={15} fontWeight={800} fill={COLORS.success}>
              Excluded = 135 − 100 = 35
            </text>
          </Reveal>
        </>
      )}
    </VisualFrame>
  );
}

/* ================================================================ */
/* 8. Member replaced                                                 */
/* ================================================================ */
function MemberReplacedVisual() {
  return (
    <VisualFrame steps={4} title="Δ total = Δ avg × group size">
      {(step) => (
        <>
          <Reveal at={0} step={step}>
            <text x={280} y={30} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">
              Group of 8 · avg 25 → 26
            </text>
            {/* Before state: 8 dots */}
            {Array.from({ length: 8 }).map((_, i) => (
              <circle key={i} cx={80 + i * 55} cy={110} r={13} fill={COLORS.primary} opacity={0.35} />
            ))}
            <text x={280} y={150} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.6}>
              One member is replaced
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <circle cx={120} cy={200} r={28} fill={COLORS.dangerSoft} stroke={COLORS.danger} strokeWidth={2} />
            <text x={120} y={206} textAnchor="middle" fontSize={13} fontWeight={800} fill={COLORS.danger}>22</text>
            <text x={120} y={245} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>leaves</text>
          </Reveal>

          <Reveal at={2} step={step}>
            <circle cx={440} cy={200} r={28} fill={COLORS.successSoft} stroke={COLORS.success} strokeWidth={2} />
            <text x={440} y={206} textAnchor="middle" fontSize={13} fontWeight={800} fill={COLORS.success}>?</text>
            <text x={440} y={245} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>joins</text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x={280} y={272} textAnchor="middle" fontSize={14} fontWeight={800} fill={COLORS.success}>
              Δavg +1 → Δtotal +8 → new = 22 + 8 = 30
            </text>
          </Reveal>
        </>
      )}
    </VisualFrame>
  );
}

/* ================================================================ */
/* 9. Multi change                                                    */
/* ================================================================ */
function MultiChangeVisual() {
  return (
    <VisualFrame steps={4} title="Net Δ = added − removed">
      {(step) => (
        <>
          <Reveal at={0} step={step}>
            <text x={280} y={28} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">
              10 numbers · avg 30
            </text>
            <text x={280} y={52} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.75}>
              Old total = 300
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <rect x={80} y={90} width={160} height={70} rx={8} fill={COLORS.dangerSoft} stroke={COLORS.danger} strokeWidth={1.5} />
            <text x={160} y={120} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS.danger}>Removed</text>
            <text x={160} y={142} textAnchor="middle" fontSize={12} fill="currentColor">25, 35 → 60</text>
          </Reveal>

          <Reveal at={2} step={step}>
            <rect x={320} y={90} width={160} height={70} rx={8} fill={COLORS.successSoft} stroke={COLORS.success} strokeWidth={1.5} />
            <text x={400} y={120} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS.success}>Added</text>
            <text x={400} y={142} textAnchor="middle" fontSize={12} fill="currentColor">40, 30 → 70</text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x={280} y={210} textAnchor="middle" fontSize={13} fill="currentColor">
              New total = 300 − 60 + 70 = 310
            </text>
            <text x={280} y={240} textAnchor="middle" fontSize={15} fontWeight={800} fill={COLORS.success}>
              New avg = 310 ÷ 10 = 31
            </text>
          </Reveal>
        </>
      )}
    </VisualFrame>
  );
}

/* ================================================================ */
/* 10. Age timeline                                                   */
/* ================================================================ */
function AgeTimelineVisual() {
  return (
    <VisualFrame steps={4} title="t years → avg rises by t">
      {(step) => (
        <>
          <Reveal at={0} step={step}>
            <line x1={60} y1={140} x2={500} y2={140} stroke="currentColor" strokeOpacity={0.25} strokeWidth={2} />
            {[0, 1, 2, 3, 4].map((i) => (
              <circle key={i} cx={80 + i * 100} cy={140} r={5} fill="currentColor" opacity={0.5} />
            ))}
            <text x={80} y={170} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>-4y</text>
            <text x={280} y={170} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>now</text>
            <text x={480} y={170} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>+4y</text>
          </Reveal>

          <Reveal at={1} step={step}>
            <circle cx={280} cy={140} r={14} fill={COLORS.primary} />
            <text x={280} y={100} textAnchor="middle" fontSize={13} fontWeight={800} fill={COLORS.primary}>
              Avg = 25
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <circle cx={480} cy={140} r={14} fill={COLORS.success} />
            <text x={480} y={100} textAnchor="middle" fontSize={13} fontWeight={800} fill={COLORS.success}>
              Avg = 29
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x={280} y={230} textAnchor="middle" fontSize={13} fill="currentColor">
              Each person ages 4 years → average rises by 4
            </text>
          </Reveal>
        </>
      )}
    </VisualFrame>
  );
}

/* ================================================================ */
/* 11. Speed — equal distance                                         */
/* ================================================================ */
function SpeedDistanceVisual() {
  return (
    <VisualFrame steps={4} title="Equal distance → harmonic mean">
      {(step) => (
        <>
          <Reveal at={0} step={step}>
            <line x1={60} y1={100} x2={500} y2={100} stroke="currentColor" strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
            <text x={60} y={80} fontSize={12} fontWeight={700} fill="currentColor">A</text>
            <text x={500} y={80} fontSize={12} fontWeight={700} fill="currentColor">B</text>
            <text x={280} y={130} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS.primary}>
              Going: 30 km/h
            </text>
            <text x={280} y={165} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS.success}>
              Returning: 50 km/h
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x={280} y={200} textAnchor="middle" fontSize={12} fill={COLORS.danger}>
              ✗ (30 + 50) / 2 = 40 is WRONG
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x={280} y={226} textAnchor="middle" fontSize={12} fontFamily="monospace" fill="currentColor">
              Avg = (2 · 30 · 50) / (30 + 50)
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x={280} y={258} textAnchor="middle" fontSize={15} fontWeight={800} fill={COLORS.success}>
              = 3000 / 80 = 37.5 km/h
            </text>
          </Reveal>
        </>
      )}
    </VisualFrame>
  );
}

/* ================================================================ */
/* 12. Speed — equal time                                             */
/* ================================================================ */
function SpeedTimeVisual() {
  return (
    <VisualFrame steps={3} title="Equal time → arithmetic mean">
      {(step) => (
        <>
          <Reveal at={0} step={step}>
            <rect x={60} y={100} width={200} height={40} rx={6} fill={COLORS.primarySoft} stroke={COLORS.primary} strokeWidth={1.5} />
            <text x={160} y={126} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.primary}>
              40 km/h · 2h
            </text>
            <rect x={300} y={100} width={200} height={40} rx={6} fill={COLORS.successSoft} stroke={COLORS.success} strokeWidth={1.5} />
            <text x={400} y={126} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.success}>
              60 km/h · 2h
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x={280} y={180} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.75}>
              Times are equal → arithmetic mean works
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x={280} y={228} textAnchor="middle" fontSize={15} fontWeight={800} fill={COLORS.success}>
              Avg = (40 + 60) / 2 = 50 km/h
            </text>
          </Reveal>
        </>
      )}
    </VisualFrame>
  );
}

/* ================================================================ */
/* 13. Weighted balance                                               */
/* ================================================================ */
function WeightedBalanceVisual() {
  return (
    <VisualFrame steps={4} title="Weighted by group size">
      {(step) => (
        <>
          <Reveal at={0} step={step}>
            <rect x={80} y={80} width={120} height={120} rx={8} fill={COLORS.primarySoft} stroke={COLORS.primary} strokeWidth={1.5} />
            <text x={140} y={115} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS.primary}>30 students</text>
            <text x={140} y={140} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>avg 70</text>
            <text x={140} y={168} textAnchor="middle" fontSize={12} fill="currentColor">= 2100</text>
          </Reveal>

          <Reveal at={1} step={step}>
            <rect x={360} y={100} width={100} height={100} rx={8} fill={COLORS.successSoft} stroke={COLORS.success} strokeWidth={1.5} />
            <text x={410} y={130} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS.success}>20 students</text>
            <text x={410} y={152} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>avg 80</text>
            <text x={410} y={175} textAnchor="middle" fontSize={12} fill="currentColor">= 1600</text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x={280} y={222} textAnchor="middle" fontSize={12} fill="currentColor">
              Combined total = 2100 + 1600 = 3700
            </text>
          </Reveal>

          <Reveal at={3} step={step}>
            <text x={280} y={252} textAnchor="middle" fontSize={14} fontWeight={800} fill={COLORS.success}>
              Combined avg = 3700 ÷ 50 = 74
            </text>
          </Reveal>
        </>
      )}
    </VisualFrame>
  );
}

/* ================================================================ */
/* 14. Correction                                                     */
/* ================================================================ */
function CorrectionFixVisual() {
  return (
    <VisualFrame steps={3} title="Fix the sum, then re-average">
      {(step) => (
        <>
          <Reveal at={0} step={step}>
            <rect x={80} y={90} width={400} height={70} rx={8} fill={COLORS.dangerSoft} stroke={COLORS.danger} strokeWidth={1.5} />
            <text x={280} y={122} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS.danger}>
              Wrong sum (30 × 70 = 2100)
            </text>
            <text x={280} y={145} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>
              Contained a wrong score: 60 instead of 90
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x={280} y={195} textAnchor="middle" fontSize={13} fill="currentColor">
              Corrected sum = 2100 − 60 + 90 = 2130
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x={280} y={242} textAnchor="middle" fontSize={15} fontWeight={800} fill={COLORS.success}>
              Correct avg = 2130 ÷ 30 = 71
            </text>
          </Reveal>
        </>
      )}
    </VisualFrame>
  );
}

/* ================================================================ */
/* 15. Two groups combine                                             */
/* ================================================================ */
function TwoGroupCombineVisual() {
  return (
    <VisualFrame steps={3} title="n₁ : n₂ = (a₂ − A) : (A − a₁)">
      {(step) => (
        <>
          <Reveal at={0} step={step}>
            <circle cx={120} cy={130} r={40} fill={COLORS.primarySoft} stroke={COLORS.primary} strokeWidth={2} />
            <text x={120} y={136} textAnchor="middle" fontSize={13} fontWeight={800} fill={COLORS.primary}>a₁ = 30</text>
            <circle cx={440} cy={130} r={40} fill={COLORS.successSoft} stroke={COLORS.success} strokeWidth={2} />
            <text x={440} y={136} textAnchor="middle" fontSize={13} fontWeight={800} fill={COLORS.success}>a₂ = 50</text>
          </Reveal>

          <Reveal at={1} step={step}>
            <text x={280} y={136} textAnchor="middle" fontSize={14} fontWeight={800} fill={COLORS.amber}>
              Combined = 40
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x={280} y={218} textAnchor="middle" fontSize={13} fill="currentColor">
              n₁ : n₂ = (50 − 40) : (40 − 30)
            </text>
            <text x={280} y={248} textAnchor="middle" fontSize={15} fontWeight={800} fill={COLORS.success}>
              = 10 : 10 = 1 : 1
            </text>
          </Reveal>
        </>
      )}
    </VisualFrame>
  );
}

/* ================================================================ */
/* 16. Batsman progression                                            */
/* ================================================================ */
function BatsmanChartVisual() {
  const innings = [30, 40, 25, 45, 35];
  return (
    <VisualFrame steps={3} title="New avg = (Old total + new) ÷ (n+1)">
      {(step) => (
        <>
          <Reveal at={0} step={step}>
            {innings.map((v, i) => (
              <g key={i}>
                <rect x={60 + i * 70} y={200 - v * 2} width={50} height={v * 2} rx={4} fill={COLORS.primary} opacity={0.8} />
                <text x={85 + i * 70} y={200 - v * 2 - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLORS.primary}>
                  {v}
                </text>
              </g>
            ))}
            <text x={280} y={230} textAnchor="middle" fontSize={12} fill="currentColor">
              Total = 175 (avg = 35)
            </text>
          </Reveal>

          <Reveal at={1} step={step}>
            <rect x={410} y={200 - 80 * 2} width={50} height={80 * 2} rx={4} fill={COLORS.success} />
            <text x={435} y={200 - 80 * 2 - 6} textAnchor="middle" fontSize={11} fontWeight={800} fill={COLORS.success}>
              80
            </text>
          </Reveal>

          <Reveal at={2} step={step}>
            <text x={280} y={268} textAnchor="middle" fontSize={14} fontWeight={800} fill={COLORS.success}>
              New avg = (175 + 80) ÷ 6 = 42.5
            </text>
          </Reveal>
        </>
      )}
    </VisualFrame>
  );
}

export const AVERAGES_VISUAL_REGISTRY = {
  barAverage: BarAverageVisual,
  missingLine: MissingLineVisual,
  triadTriangle: TriadTriangleVisual,
  consecutiveDots: ConsecutiveDotsVisual,
  seriesSum: SeriesSumVisual,
  memberAdded: MemberAddedVisual,
  memberRemoved: MemberRemovedVisual,
  memberReplaced: MemberReplacedVisual,
  multiChange: MultiChangeVisual,
  ageTimeline: AgeTimelineVisual,
  speedDistance: SpeedDistanceVisual,
  speedTime: SpeedTimeVisual,
  weightedBalance: WeightedBalanceVisual,
  correctionFix: CorrectionFixVisual,
  twoGroupCombine: TwoGroupCombineVisual,
  batsmanChart: BatsmanChartVisual,
};