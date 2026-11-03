import { COLOR_PALETTE } from '../../app/design/designTokens';
// Rank tiers by score (like a game ladder). Pure client-side: the server only returns scores.
export const TIERS = [
  { key: 'bronze', name: 'Bronze', min: 0, color: COLOR_PALETTE.orange[700] },
  { key: 'silver', name: 'Silver', min: 150, color: COLOR_PALETTE.slate[400] },
  { key: 'gold', name: 'Gold', min: 500, color: COLOR_PALETTE.amber[500] },
  { key: 'platinum', name: 'Platinum', min: 1200, color: COLOR_PALETTE.cyan[400] },
  { key: 'diamond', name: 'Diamond', min: 2500, color: COLOR_PALETTE.indigo[400] },
  { key: 'legend', name: 'Legend', min: 5000, color: COLOR_PALETTE.rose[500] },
];

export function tierFor(score) {
  let idx = 0;
  TIERS.forEach((t, i) => { if (score >= t.min) idx = i; });
  const tier = TIERS[idx];
  const next = TIERS[idx + 1] || null;
  const progress = next ? Math.min(100, Math.round(((score - tier.min) / (next.min - tier.min)) * 100)) : 100;
  return { tier, next, progress, toNext: next ? next.min - score : 0 };
}
