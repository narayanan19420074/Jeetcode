import { COLORS, Reveal, VisualFrame } from './visualPrimitives';

/* ================================================================ */
/* 1. Bar chart with average line                                     */
/* ================================================================ */
export function BarAverageVisual() {
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
export function MissingLineVisual() {
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
export function TriadTriangleVisual() {
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

