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
// Same glass + neumorphism language as the contest page: raised = light edge one side, soft shadow the other.
const LIGHT = {
  dark: false, ink: '#1E1B4B', muted: '#5B6478', soft: '#EEF1FB',
  raised: '5px 5px 12px rgba(148,163,184,0.4), -5px -5px 12px rgba(255,255,255,0.95)',
  pressed: 'inset 4px 4px 9px rgba(148,163,184,0.4), inset -4px -4px 9px rgba(255,255,255,0.95)',
  panel: 'linear-gradient(160deg,#F5F3FF 0%,#EEF2FF 50%,#FDF2F8 100%)', border: '1px solid rgba(255,255,255,0.9)', panelShadow: '0 24px 50px -30px rgba(76,29,149,0.4)',
  pill: 'rgba(255,255,255,0.78)', icon: '#6366F1', line: 'rgba(99,102,241,0.14)',
};
const DARK = {
  dark: true, ink: '#EEF2FF', muted: '#A5B4FC', soft: '#232152',
  raised: '5px 5px 12px rgba(4,3,24,0.6), -4px -4px 10px rgba(129,140,248,0.10)',
  pressed: 'inset 4px 4px 9px rgba(4,3,24,0.65), inset -3px -3px 8px rgba(129,140,248,0.10)',
  panel: 'linear-gradient(160deg,#17153B 0%,#1B1A4A 50%,#2A1650 100%)', border: '1px solid rgba(165,180,252,0.16)', panelShadow: '0 24px 50px -30px rgba(0,0,0,0.8)',
  pill: 'rgba(35,33,82,0.82)', icon: '#A5B4FC', line: 'rgba(165,180,252,0.16)',
};
export const useQuestTheme = () => (useTheme().palette.mode === 'dark' ? DARK : LIGHT);

// Loud badge colours. Every quest gets one by what it is about, so the list reads at a glance.
export const VIBRANT = {
  fire: { bg: 'linear-gradient(135deg,#FF9A00,#FF3D81)', glow: '#FF5E7E' },
  violet: { bg: 'linear-gradient(135deg,#7C4DFF,#E040FB)', glow: '#A855F7' },
  cyan: { bg: 'linear-gradient(135deg,#00E5FF,#2979FF)', glow: '#22D3EE' },
  lime: { bg: 'linear-gradient(135deg,#B2FF59,#00E676)', glow: '#34D399' },
  gold: { bg: 'linear-gradient(135deg,#FFE259,#FFA751)', glow: '#FBBF24' },
  diamond: { bg: 'linear-gradient(135deg,#67E8F9,#818CF8 55%,#E879F9)', glow: '#818CF8' },
};

export function questBadge(quest) {
  if (quest.reward.type === 'pro') return VIBRANT.diamond;
  if (quest.difficulty === 'Easy') return VIBRANT.lime;
  if (quest.difficulty === 'Medium') return VIBRANT.gold;
  if (quest.difficulty === 'Hard') return VIBRANT.fire;
  if (quest.group === 'Streaks') return VIBRANT.fire;
  if (quest.group === 'Problems solved') return VIBRANT.cyan;
  return VIBRANT.violet;
}
