import { LIBRARY_PALETTE, LIB_ACCENT } from '../dashboard/components/libraryStyle';
import { BRAND } from '../../app/design/designTokens';

// Colour tokens for the desktop leaderboard. They reuse the Library palette (cream in light mode, the app's
// dark surfaces in dark mode) so the leaderboard matches the Problems and Dashboard pages. Shadows keep the
// raised / pressed depth of the controls, only tinted to the warm Library surfaces.
const LIGHT = LIBRARY_PALETTE.light;
const DARK = LIBRARY_PALETTE.dark;

export const LB_LIGHT = {
  dark: false, ink: LIGHT.text, muted: LIGHT.muted, soft: LIGHT.player, icon: LIB_ACCENT,
  raised: '3px 3px 8px rgba(111,101,91,0.16), -3px -3px 8px rgba(255,255,255,0.9)',
  pressed: 'inset 2px 2px 6px rgba(111,101,91,0.16), inset -2px -2px 6px rgba(255,255,255,0.9)',
  panel: LIGHT.chip,
  border: `1px solid ${LIGHT.border}`,
  panelShadow: 'none',
  frameInner: LIGHT.bg, avatarBg: BRAND.avatarBg, avatarFg: BRAND.avatarFg,
  blobWarm: 'rgba(239,108,77,0.16)', blobAccent: 'rgba(99,102,241,0.12)',
};

export const LB_DARK = {
  dark: true, ink: DARK.text, muted: DARK.muted, soft: DARK.chip, icon: BRAND.primaryLight,
  raised: '4px 4px 10px rgba(0,0,0,0.45), -3px -3px 8px rgba(255,255,255,0.03)',
  pressed: 'inset 3px 3px 7px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(255,255,255,0.03)',
  panel: DARK.nav,
  border: `1px solid ${DARK.border}`,
  panelShadow: 'none',
  frameInner: DARK.chip, avatarBg: '#2B3050', avatarFg: '#C7D2FE',
  blobWarm: 'rgba(239,108,77,0.10)', blobAccent: 'rgba(99,102,241,0.14)',
};

export const lbTokens = (mode) => (mode === 'dark' ? LB_DARK : LB_LIGHT);

// Active toggle / selected track colour: the same solid accent as the Library pills.
export const ACCENT = LIB_ACCENT;

// Avatar ring colours for ranks without a medal.
export const AVATAR_FRAMES = [
  'linear-gradient(135deg,#EF6C4D,#F59E0B)',
  'linear-gradient(135deg,#6366F1,#818CF8)',
  'linear-gradient(135deg,#34D399,#22D3EE)',
  'linear-gradient(135deg,#F59E0B,#FACC15)',
  'linear-gradient(135deg,#818CF8,#EF6C4D)',
];
