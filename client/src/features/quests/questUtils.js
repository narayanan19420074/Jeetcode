import { msUntilDayEnd } from '../dashboard/dashboardUtils';
import { COLOR_PALETTE, FONT_WEIGHTS, FONT_SIZES } from '../../app/design/designTokens';

export const GOLD = COLOR_PALETTE.custom.yellowF5B301;
export const GOLD_LIGHT = COLOR_PALETTE.amber[200];
export const AMBER = COLOR_PALETTE.amber[600];
export const INK = COLOR_PALETTE.custom.slate0A1230;

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

// Local clock time when the day rolls over (midnight in India).
export const resetTimeLabel = () => new Date(Date.now() + msUntilDayEnd()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

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
  orange: COLOR_PALETTE.custom.orangeFF7A00,
  orangeHi: COLOR_PALETTE.custom.amberFFB020,
  yellow: COLOR_PALETTE.amber[400],
  green: COLOR_PALETTE.custom.green2ED573,
  red: COLOR_PALETTE.custom.redFF4757,
  diamond: COLOR_PALETTE.custom.sky27B6FF,
  coin: COLOR_PALETTE.amber[400],
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
    orange: [COLOR_PALETTE.custom.amberFFB020, COLOR_PALETTE.custom.orangeFF6A00],
    green: [COLOR_PALETTE.green[400], COLOR_PALETTE.custom.green12B35A],
    blue: [COLOR_PALETTE.custom.sky4CCBFF, COLOR_PALETTE.custom.blue1E8BFF],
    dark: [FF.panelHi, FF.panelHi],
  }[tone];
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 1, minHeight: 44, px: 2.5, border: 0, cursor: 'pointer', fontFamily: 'inherit',
    fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    color: tone === 'dark' ? FF.text : COLOR_PALETTE.gray[950], background: `linear-gradient(180deg, ${g[0]}, ${g[1]})`, clipPath: cut(9),
    transition: 'filter .15s ease, transform .1s ease', '&:hover': { filter: 'brightness(1.08)' }, '&:active': { transform: 'translateY(1px)' },
    '&:focus-visible': { outline: `2px solid ${FF.orange}`, outlineOffset: 2 },
    '&.Mui-disabled, &:disabled': { background: FF.panelHi, color: FF.muted, cursor: 'not-allowed', filter: 'none' },
  };
};

// Rarity colours players already know: grey, green, blue, purple, orange, red. Shown as a tag with dark text.
export const RARITY_COLOR = { Common: COLOR_PALETTE.custom.slateB8C0CF, Uncommon: COLOR_PALETTE.custom.green2ED573, Rare: COLOR_PALETTE.custom.sky27B6FF, Epic: COLOR_PALETTE.custom.purpleB66DFF, Legendary: COLOR_PALETTE.amber[500], Mythic: COLOR_PALETTE.custom.redFF4757 };
