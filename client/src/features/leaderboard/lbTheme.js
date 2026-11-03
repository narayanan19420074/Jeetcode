import { LIBRARY_PALETTE, LIB_ACCENT } from '../dashboard/components/libraryStyle';
import { BRAND, COLOR_PALETTE, withAlpha } from '../../app/design/designTokens';

// Colour tokens for the desktop leaderboard. They reuse the Library palette (cream in light mode, the app's
// dark surfaces in dark mode) so the leaderboard matches the Problems and Dashboard pages. Shadows keep the
// raised / pressed depth of the controls, only tinted to the warm Library surfaces.
const LIGHT = LIBRARY_PALETTE.light;
const DARK = LIBRARY_PALETTE.dark;

export const LB_LIGHT = {
  dark: false, ink: LIGHT.text, muted: LIGHT.muted, soft: LIGHT.player, icon: LIB_ACCENT,
  raised: `3px 3px 8px ${withAlpha(COLOR_PALETTE.custom.gray6F655B, 0.16)}, -3px -3px 8px ${withAlpha(COLOR_PALETTE.white, 0.9)}`,
  pressed: `inset 2px 2px 6px ${withAlpha(COLOR_PALETTE.custom.gray6F655B, 0.16)}, inset -2px -2px 6px ${withAlpha(COLOR_PALETTE.white, 0.9)}`,
  panel: LIGHT.chip,
  border: `1px solid ${LIGHT.border}`,
  panelShadow: 'none',
  frameInner: LIGHT.bg, avatarBg: BRAND.avatarBg, avatarFg: BRAND.avatarFg,
  blobWarm: withAlpha(COLOR_PALETTE.custom.redEF6C4D, 0.16), blobAccent: withAlpha(COLOR_PALETTE.indigo[500], 0.12),
};

export const LB_DARK = {
  dark: true, ink: DARK.text, muted: DARK.muted, soft: DARK.chip, icon: BRAND.primaryLight,
  raised: `4px 4px 10px ${withAlpha(COLOR_PALETTE.black, 0.45)}, -3px -3px 8px ${withAlpha(COLOR_PALETTE.white, 0.03)}`,
  pressed: `inset 3px 3px 7px ${withAlpha(COLOR_PALETTE.black, 0.5)}, inset -2px -2px 6px ${withAlpha(COLOR_PALETTE.white, 0.03)}`,
  panel: DARK.nav,
  border: `1px solid ${DARK.border}`,
  panelShadow: 'none',
  frameInner: DARK.chip, avatarBg: COLOR_PALETTE.custom.sky2B3050, avatarFg: COLOR_PALETTE.indigo[200],
  blobWarm: withAlpha(COLOR_PALETTE.custom.redEF6C4D, 0.10), blobAccent: withAlpha(COLOR_PALETTE.indigo[500], 0.14),
};

export const lbTokens = (mode) => (mode === 'dark' ? LB_DARK : LB_LIGHT);

// Active toggle / selected track colour: the same solid accent as the Library pills.
export const ACCENT = LIB_ACCENT;

// Avatar ring colours for ranks without a medal.
export const AVATAR_FRAMES = [
  `linear-gradient(135deg,${COLOR_PALETTE.custom.redEF6C4D},${COLOR_PALETTE.amber[500]})`,
  `linear-gradient(135deg,${COLOR_PALETTE.indigo[500]},${COLOR_PALETTE.indigo[400]})`,
  `linear-gradient(135deg,${COLOR_PALETTE.emerald[400]},${COLOR_PALETTE.cyan[400]})`,
  `linear-gradient(135deg,${COLOR_PALETTE.amber[500]},${COLOR_PALETTE.yellow[400]})`,
  `linear-gradient(135deg,${COLOR_PALETTE.indigo[400]},${COLOR_PALETTE.custom.redEF6C4D})`,
];
