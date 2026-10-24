// Look of every butterfly. Ids match server/src/config/butterflies.js (the server owns names, prices and who owns what;
// this file only owns colours). A butterfly the server knows but this file does not falls back to the starter look.
//
// inner / mid / outer = wing gradient from the body outwards, rim = dark edge band, spot = eye spots + glints,
// glow = aura + sparkles, body = thorax colour. rainbow = hue shifts across the wing (opal).

export const PALETTES = {
  amethyst: { inner: '#5B21B6', mid: '#A855F7', outer: '#F0ABFC', rim: '#2E1065', spot: '#FDF4FF', glow: '#C084FC', body: '#3B0764' },
  sapphire: { inner: '#1E3A8A', mid: '#3B82F6', outer: '#67E8F9', rim: '#0B1B4D', spot: '#E0F2FE', glow: '#38BDF8', body: '#172554' },
  emerald: { inner: '#065F46', mid: '#10B981', outer: '#BEF264', rim: '#022C22', spot: '#F7FEE7', glow: '#34D399', body: '#064E3B' },
  rose: { inner: '#9D174D', mid: '#EC4899', outer: '#FDA4AF', rim: '#500724', spot: '#FFF1F2', glow: '#FB7185', body: '#831843' },
  topaz: { inner: '#B45309', mid: '#F59E0B', outer: '#FEF08A', rim: '#451A03', spot: '#FFFBEB', glow: '#FBBF24', body: '#78350F' },
  opal: { inner: '#7C3AED', mid: '#22D3EE', outer: '#F9A8D4', rim: '#312E81', spot: '#FFFFFF', glow: '#A5F3FC', body: '#312E81', rainbow: true },
};

export const paletteFor = (id) => PALETTES[id] || PALETTES.amethyst;

// Rarity badges: loud on purpose. Same gradient colours in light and dark mode.
export const RARITY = {
  Starter: { stops: ['#06B6D4', '#3B82F6'], glow: '#22D3EE' },
  Common: { stops: ['#3B82F6', '#6366F1'], glow: '#60A5FA' },
  Rare: { stops: ['#10B981', '#84CC16'], glow: '#34D399' },
  Epic: { stops: ['#F97316', '#EC4899'], glow: '#FB923C' },
  Legendary: { stops: ['#EC4899', '#8B5CF6', '#06B6D4'], glow: '#E879F9' },
};

export const rarityGradient = (name) => `linear-gradient(120deg, ${(RARITY[name] || RARITY.Starter).stops.join(', ')})`;
