import { COLORS, Reveal, VisualFrame } from './visualPrimitives';

/* ================================================================ */
/* 6. Member added                                                    */
/* ================================================================ */
export function MemberAddedVisual() {
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
export function MemberRemovedVisual() {
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
export function MemberReplacedVisual() {
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
export function MultiChangeVisual() {
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

