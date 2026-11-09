import { COLORS, Reveal, VisualFrame } from './visualPrimitives';

/* ================================================================ */
/* 10. Age timeline                                                   */
/* ================================================================ */
export function AgeTimelineVisual() {
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
export function SpeedDistanceVisual() {
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
export function SpeedTimeVisual() {
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
export function WeightedBalanceVisual() {
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

