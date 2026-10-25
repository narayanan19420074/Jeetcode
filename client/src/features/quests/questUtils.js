import { msUntilUtcMidnight } from '../dashboard/dashboardUtils';

export const GOLD = '#F5B301';
export const GOLD_LIGHT = '#FDE68A';
export const AMBER = '#D97706';
export const INK = '#0A1230';

export const LEVEL_XP = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
export const RANKS = ['Rookie', 'Learner', 'Challenger', 'Grinder', 'Contender', 'Specialist', 'Veteran', 'Elite', 'Master', 'Legend'];

export function levelInfo(xp) {
  let level = 1;
  LEVEL_XP.forEach((t, i) => {
    if (xp >= t) level = i + 1;
  });
  const max = level >= LEVEL_XP.length;
  const from = LEVEL_XP[level - 1];
  const to = max ? from : LEVEL_XP[level];
  return { level, rank: RANKS[level - 1], from, to, max, pct: max ? 100 : ((xp - from) / (to - from)) * 100, toNext: max ? 0 : to - xp };
}

// The big prize the student is working towards: the first Pro reward not claimed yet.
export const goalMilestone = (milestones) => milestones.find((m) => m.reward.type === 'pro' && !m.claimed) || milestones[milestones.length - 1];

// Local clock time when the UTC day rolls over (5:30 AM in India).
export const resetTimeLabel = () => new Date(Date.now() + msUntilUtcMidnight()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ---------------------------------------------------------------- look
// Battle-royale lobby look (Free Fire style): hard cut corners, heavy uppercase labels, orange as the main action
// colour, green for "claim", blue for diamonds, gold for coins. Used by the Quests page and the Store.
// Surfaces and text come from CSS variables (--ff-*, set per mode in theme.js) so light and dark both look right;
// the "Ink" colours are the accent shades that stay readable as text on those surfaces.
export const FF = {
  bg: 'var(--ff-bg)',
  panel: 'var(--ff-panel)',
  panelHi: 'var(--ff-panel-hi)',
  line: 'var(--ff-line)',
  well: 'var(--ff-well)',
  hud: 'var(--ff-hud)',
  text: 'var(--ff-text)',
  muted: 'var(--ff-muted)',
  orangeInk: 'var(--ff-orange-ink)',
  greenInk: 'var(--ff-green-ink)',
  blueInk: 'var(--ff-blue-ink)',
  coinInk: 'var(--ff-coin-ink)',
  redInk: 'var(--ff-red-ink)',
  // fills: bright in both modes, so they carry dark text (#10131A) or sit as icons
  orange: '#FF7A00',
  orangeHi: '#FFB020',
  yellow: '#FFC933',
  green: '#2ED573',
  red: '#FF4757',
  diamond: '#27B6FF',
  coin: '#FFC933',
};

// Cut-corner shape used by every panel and button.
export const cut = (n = 10) => `polygon(${n}px 0, 100% 0, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0 100%, 0 ${n}px)`;

// Panel with a real 1px border that follows the cut corners (a plain border would break at the diagonals):
// the element is the border colour, ::before is the fill, inset by 1px. Change the fill with '--ff-fill'.
export const panelSx = (n = 14) => ({
  position: 'relative',
  isolation: 'isolate',
  bgcolor: FF.line,
  color: FF.text,
  clipPath: cut(n),
  '&::before': { content: '""', position: 'absolute', inset: '1px', zIndex: -1, bgcolor: 'var(--ff-fill, var(--ff-panel))', clipPath: cut(n - 1) },
});

export const buttonSx = (tone = 'orange') => {
  const g = {
    orange: ['#FFB020', '#FF6A00'],
    green: ['#4BE38A', '#12B35A'],
    blue: ['#4CCBFF', '#1E8BFF'],
    dark: [FF.panelHi, FF.panelHi],
  }[tone];
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, minHeight: 44, px: 2.5, border: 0, cursor: 'pointer', fontFamily: 'inherit',
    fontWeight: 900, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    color: tone === 'dark' ? FF.text : '#10131A', background: `linear-gradient(180deg, ${g[0]}, ${g[1]})`, clipPath: cut(9),
    transition: 'filter .15s ease, transform .1s ease', '&:hover': { filter: 'brightness(1.08)' }, '&:active': { transform: 'translateY(1px)' },
    '&:focus-visible': { outline: `2px solid ${FF.orange}`, outlineOffset: 2 },
    '&.Mui-disabled, &:disabled': { background: FF.panelHi, color: FF.muted, cursor: 'not-allowed', filter: 'none' },
  };
};

// Rarity colours players already know: grey, green, blue, purple, orange, red. Shown as a tag with dark text.
export const RARITY_COLOR = { Common: '#B8C0CF', Uncommon: '#2ED573', Rare: '#27B6FF', Epic: '#B66DFF', Legendary: '#FF9F1A', Mythic: '#FF4757' };
