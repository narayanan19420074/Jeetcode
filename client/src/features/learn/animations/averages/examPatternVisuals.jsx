import { COLORS, Reveal, VisualFrame } from './visualPrimitives';

/* ================================================================ */
/* 14. Correction                                                     */
/* ================================================================ */
export function CorrectionFixVisual() {
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
export function TwoGroupCombineVisual() {
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

export function BatsmanChartVisual() {
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
