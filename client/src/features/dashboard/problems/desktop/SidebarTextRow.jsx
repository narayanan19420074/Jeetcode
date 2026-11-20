import { ButtonBase, Typography } from '@mui/material';
import { tint } from '../../dashboardUtils';
import { LIB_ACCENT, LIB_TRACKING, useLibraryPalette } from '../../components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../../app/design/designTokens';

const ACTIVE_TINT_PERCENT = 14;

// Plain text row of the sidebar lists (topics and saved lists): no icon, an optional count, a soft tint when selected.
export default function SidebarTextRow({ label, count, active, onClick }) {
  const palette = useLibraryPalette();
  const activeBackground = tint(LIB_ACCENT, ACTIVE_TINT_PERCENT);
  return (
    <ButtonBase
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      sx={{ width: SIZES.fill, justifyContent: 'space-between', gap: 1, px: 1.5, height: SIZES.navItemHeightDense, borderRadius: RADII_PX.card, textAlign: 'left', fontFamily: 'inherit', letterSpacing: LIB_TRACKING, color: palette.text, bgcolor: active ? activeBackground : 'transparent', '&:hover': { bgcolor: active ? activeBackground : palette.chip } }}
    >
      <Typography noWrap sx={{ flex: 1, fontSize: FONT_SIZES.body, fontWeight: active ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium }}>{label}</Typography>
      {count !== undefined && <Typography variant="caption" sx={{ color: palette.muted, fontVariantNumeric: 'tabular-nums' }}>{count}</Typography>}
    </ButtonBase>
  );
}
