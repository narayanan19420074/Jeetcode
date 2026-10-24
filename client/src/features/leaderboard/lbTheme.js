// Neumorphic + glass tokens for the leaderboard. Same family as the contest page (WinnersPanel):
// raised = light edge on one side + soft shadow on the other, pressed = the same, inset.
export const LB_LIGHT = {
  dark: false, ink: '#1E1B4B', muted: '#64748B', soft: '#EEF1FB', icon: '#6366F1',
  raised: '5px 5px 12px rgba(148,163,184,0.4), -5px -5px 12px rgba(255,255,255,0.95)',
  pressed: 'inset 4px 4px 9px rgba(148,163,184,0.4), inset -4px -4px 9px rgba(255,255,255,0.95)',
  panel: 'linear-gradient(160deg,#F5F3FF 0%,#EEF2FF 50%,#FDF2F8 100%)',
  border: '1px solid rgba(255,255,255,0.9)',
  panelShadow: '0 24px 50px -30px rgba(76,29,149,0.4)',
  frameInner: '#F8FAFF', avatarBg: '#E0E7FF', avatarFg: '#4338CA',
};

export const LB_DARK = {
  dark: true, ink: '#EEF2FF', muted: '#A5B4FC', soft: '#232152', icon: '#A5B4FC',
  raised: '5px 5px 12px rgba(4,3,24,0.6), -4px -4px 10px rgba(129,140,248,0.10)',
  pressed: 'inset 4px 4px 9px rgba(4,3,24,0.65), inset -3px -3px 8px rgba(129,140,248,0.10)',
  panel: 'linear-gradient(160deg,#17153B 0%,#1B1A4A 50%,#2A1650 100%)',
  border: '1px solid rgba(165,180,252,0.16)',
  panelShadow: '0 24px 50px -30px rgba(0,0,0,0.8)',
  frameInner: '#1B1A4A', avatarBg: '#312E81', avatarFg: '#C7D2FE',
};

export const lbTokens = (mode) => (mode === 'dark' ? LB_DARK : LB_LIGHT);

// Active toggle / selected track colour.
export const ACCENT = 'linear-gradient(135deg,#8B5CF6,#6366F1)';

// Avatar ring colours for ranks without a medal.
export const AVATAR_FRAMES = [
  'linear-gradient(135deg,#FF9A3C,#FF3D81,#7C4DFF)',
  'linear-gradient(135deg,#22D3EE,#6366F1,#A855F7)',
  'linear-gradient(135deg,#34D399,#22D3EE,#3B82F6)',
  'linear-gradient(135deg,#F472B6,#FB923C,#FACC15)',
  'linear-gradient(135deg,#60A5FA,#34D399,#A3E635)',
];
