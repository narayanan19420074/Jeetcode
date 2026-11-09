import { COLOR_PALETTE } from '../../../app/design/designTokens';
import { LIB_ACCENT, libIconBtnSx, libSmallBtnSx, libSolidBtnSx } from '../../dashboard/components/libraryStyle';
import { tint } from '../../dashboard/dashboardUtils';

export const ACCENT = LIB_ACCENT;

export const SUCCESS = 'var(--jc-easy)';

export const REQUEST_TABS = ['friends', 'requests', 'sent'];

export const scrollRow = {
  display: 'flex',
  gap: 1,
  overflowX: 'auto',
  mx: -2,
  px: 2,
  pb: 0.5,
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

export const solidBtn = libSolidBtnSx;

export const smallBtn = (c) => ({ ...libSmallBtnSx, bgcolor: tint(c, 20), color: c, '&:hover': { bgcolor: tint(c, 30) } });

// Accent buttons are neutral cream pills (solid accent when switched on); other colours stay tinted.
export const tintIcon = (c, on = false) => (t) =>
  c === ACCENT
    ? on
      ? { ...libIconBtnSx, bgcolor: ACCENT, color: COLOR_PALETTE.white, '&:hover': { bgcolor: ACCENT } }
      : libIconBtnSx
    : { width: 40, height: 40, flexShrink: 0, bgcolor: tint(c, t.palette.mode === 'dark' ? 16 : 12), color: c, '&:hover': { bgcolor: tint(c, 22) } };
