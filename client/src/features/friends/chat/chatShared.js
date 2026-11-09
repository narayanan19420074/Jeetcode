import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { tint } from '../../dashboard/dashboardUtils';
import { wsSurface } from '../../workspace/workspaceTheme';

export const clock = (iso) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export const addUnique = (list, m) => (list.some((x) => x.id === m.id) ? list : [...list, m]);

export const EMOJIS = ['👍', '🔥', '😂', '🙌', '👏', '💪', '🎯', '✅', '🤝', '😅', '🤔', '😎', '🙏', '🚀', '💡', '🎉'];

// Centered system line (day separators, nudges). Flat: a quiet tonal chip, no shadow.
export const pill = (t) => ({ alignSelf: 'center', px: 1.5, py: 0.5, borderRadius: RADII_PX.pill, bgcolor: wsSurface(t).raised, color: t.palette.text.secondary, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.semibold });

// Flat card look shared by room invites and nudges.
export const flatCard = (t) => ({ bgcolor: t.palette.background.paper, border: `1px solid ${t.palette.divider}` });

export const LIB_SUCCESS = 'var(--jc-easy)';

export const NUDGE_TONE = { color: COLOR_PALETTE.custom.amberF09A2E, bg: COLOR_PALETTE.orange[50] };

export const ROOM_TONE = { color: COLOR_PALETTE.custom.blue3F8CE8, bg: COLOR_PALETTE.blue[50] };

// Category-card background: light pastel in light mode, soft tint in dark mode.
export const toneBg = (t, tone) => (t.palette.mode === 'dark' ? tint(tone.color, 16) : tone.bg);

export const libDayPill = { alignSelf: 'center', px: 2, py: 0.5, borderRadius: RADII_PX.pill, bgcolor: 'var(--lib-chip)', color: 'var(--lib-chip-text)', fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING };
