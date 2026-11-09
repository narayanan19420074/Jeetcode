import { COLOR_PALETTE } from '../../../app/design/designTokens';
import { tint } from '../../dashboard/dashboardUtils';
import { libIconBtnSx, libSolidBtnSx } from '../../dashboard/components/libraryStyle';
import { planTheme } from '../planUtils';

// Shared style constants of the phone Study Plan screens (Library look).
export const ACCENT = COLOR_PALETTE.indigo[500];

// Each plan keeps its own colour (same stable pick as the wide-screen cards, see planTheme).
export const PLAN_ACCENT = { indigo: COLOR_PALETTE.indigo[500], teal: COLOR_PALETTE.teal[500], rose: COLOR_PALETTE.rose[500], ocean: COLOR_PALETTE.blue[500], plum: COLOR_PALETTE.purple[500], ember: COLOR_PALETTE.orange[500] };
export const accentFor = (id) => PLAN_ACCENT[planTheme(id).name] || ACCENT;
export const TONE = { info: COLOR_PALETTE.blue[500], success: 'var(--jc-easy)', warning: 'var(--jc-medium)', error: 'var(--jc-hard)' };

export const SHORT_DIFF = { Easy: 'Easy', Medium: 'Med.', Hard: 'Hard' };

export const MUTED = 'var(--lib-muted)';
export const DIVIDER = 'var(--lib-divider)';

export const solidBtn = (c) => ({ ...libSolidBtnSx, bgcolor: c, '&:hover': { bgcolor: `color-mix(in srgb, ${c} 85%, ${COLOR_PALETTE.black})` } });

// 44px round action button. Inside a cream card it sits on the page colour so it stays visible in both modes.
export const cardIconSx = { ...libIconBtnSx, width: 44, height: 44, bgcolor: 'var(--lib-bg)', '&:hover': { bgcolor: 'var(--lib-bg)', filter: 'brightness(0.97)' } };
export const dangerIconSx = (t) => ({
  ...cardIconSx,
  color: t.palette.error.main,
  bgcolor: tint(t.palette.error.main, 12),
  '&:hover': { bgcolor: tint(t.palette.error.main, 20) },
});
