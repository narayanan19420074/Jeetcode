import { useTheme } from '@mui/material';
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
// Battle-royale lobby look (Free Fire style): hard cut corners, orange as the main action colour, green for "claim",
// blue for diamonds, yellow for coins. Dark mode is the in-game look (near-black panels); light mode keeps the same
// shapes and colours on white panels, with the accent colours a little deeper so text stays readable.
const FF_DARK = {
  dark: true, bg: '#0B0E14', panel: '#151A24', panelHi: '#1D2431', inset: '#0B0E14', hud: 'rgba(11,14,20,0.82)', line: '#2B3345',
  text: '#FFFFFF', muted: '#8E99AD', orange: '#FF7A00', orangeHi: '#FFB020', yellow: '#FFC933', green: '#2ED573', red: '#FF4757', diamond: '#27B6FF', coin: '#FFC933',
};
const FF_LIGHT = {
  dark: false, bg: '#F3F5FA', panel: '#FFFFFF', panelHi: '#E9EDF5', inset: '#E4E9F3', hud: 'rgba(255,255,255,0.88)', line: '#D3DAE8',
  text: '#141824', muted: '#5E6A82', orange: '#F26A00', orangeHi: '#FF9A1F', yellow: '#D99A00', green: '#14A85A', red: '#E5364B', diamond: '#0A8FE0', coin: '#E0A100',
};
export const useFF = () => (useTheme().palette.mode === 'dark' ? FF_DARK : FF_LIGHT);

// Cut-corner shape used by every panel and button.
export const cut = (n = 10) => `polygon(${n}px 0, 100% 0, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0 100%, 0 ${n}px)`;

export const panelSx = (F) => ({ bgcolor: F.panel, border: `1px solid ${F.line}`, clipPath: cut(12), color: F.text });

export const buttonSx = (tone, F) => {
  const g = {
    orange: ['#FFB020', '#FF6A00'],
    green: ['#4BE38A', '#12B35A'],
    blue: ['#4CCBFF', '#1E8BFF'],
    dark: [F.panelHi, F.panelHi],
  }[tone];
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, minHeight: 44, px: 2.5, border: 0, cursor: 'pointer', fontFamily: 'inherit',
    fontWeight: 900, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    color: tone === 'dark' ? F.text : '#10131A', background: `linear-gradient(180deg, ${g[0]}, ${g[1]})`, clipPath: cut(9),
    transition: 'filter .15s ease, transform .1s ease', '&:hover': { filter: 'brightness(1.1)' }, '&:active': { transform: 'translateY(1px)' },
    '&:focus-visible': { outline: `2px solid ${F.yellow}`, outlineOffset: 2 },
    '&.Mui-disabled, &:disabled': { background: F.panelHi, color: F.muted, cursor: 'not-allowed', filter: 'none' },
  };
};

// Rarity colours players already know: grey, green, blue, purple, orange, red.
const RARITY_DARK = { Common: '#B8C0CF', Uncommon: '#2ED573', Rare: '#27B6FF', Epic: '#B66DFF', Legendary: '#FF9F1A', Mythic: '#FF4757' };
const RARITY_LIGHT = { Common: '#7B8499', Uncommon: '#14A85A', Rare: '#0A8FE0', Epic: '#8E3FE0', Legendary: '#E8780C', Mythic: '#E5364B' };
export const rarityColor = (name, dark) => (dark ? RARITY_DARK : RARITY_LIGHT)[name] || (dark ? '#8E99AD' : '#5E6A82');
