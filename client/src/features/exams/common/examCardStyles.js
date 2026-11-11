import { COLOR_PALETTE, SIZES } from '../../../app/design/designTokens';
import { LIB_ACCENT, libSmallBtnSx, libSolidBtnSx, libTintBtnSx } from '../../dashboard/components/libraryStyle';

// The two actions of an exam card share the Library button shape and the compact height.
const compactButton = { height: SIZES.listRowHeightDense, px: 2, fontSize: libSmallBtnSx.fontSize, flex: 1 };

export const applyButtonSx = { ...libSolidBtnSx, ...compactButton, bgcolor: LIB_ACCENT, color: COLOR_PALETTE.white };
export const mockTestButtonSx = { ...libTintBtnSx, ...compactButton };
