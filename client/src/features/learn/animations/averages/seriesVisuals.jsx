import { COLORS, Reveal, VisualFrame } from './visualPrimitives';

/* ================================================================ */
/* 4. Consecutive dots                                                */
/* ================================================================ */
export function ConsecutiveDotsVisual() {
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
export function SeriesSumVisual() {
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

