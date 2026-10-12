// Rank tiers by score (like a game ladder). Pure client-side: the server only returns scores.
export const TIERS = [
  { key: 'bronze', name: 'Bronze', min: 0, color: '#C2410C' },
  { key: 'silver', name: 'Silver', min: 150, color: '#94A3B8' },
  { key: 'gold', name: 'Gold', min: 500, color: '#F59E0B' },
  { key: 'platinum', name: 'Platinum', min: 1200, color: '#22D3EE' },
  { key: 'diamond', name: 'Diamond', min: 2500, color: '#818CF8' },
  { key: 'legend', name: 'Legend', min: 5000, color: '#F43F5E' },
];

export function tierFor(score) {
  let idx = 0;
  TIERS.forEach((t, i) => { if (score >= t.min) idx = i; });
  const tier = TIERS[idx];
  const next = TIERS[idx + 1] || null;
  const progress = next ? Math.min(100, Math.round(((score - tier.min) / (next.min - tier.min)) * 100)) : 100;
  return { tier, next, progress, toNext: next ? next.min - score : 0 };
}
