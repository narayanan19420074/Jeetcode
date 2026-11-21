import { Box, ButtonBase, Typography } from '@mui/material';
import { LIB_TRACKING, useLibraryPalette } from '../features/dashboard/components/libraryStyle';
import { hoverScrollbarSx } from './hoverScrollbar';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES, withAlpha } from '../app/design/designTokens';

const SELECTED_ROW_ALPHA = 0.05;

// Fill of the open row and of a hovered row: a touch darker than the card.
const menuRowFill = (pal) => withAlpha(pal.text, SELECTED_ROW_ALPHA);

// A soft grey menu card with a centred title and a hairline under it. The sidebars of the Aptitude and Problems pages
// share it. The title stays in place; only the rows scroll when the window is short, and their scrollbar shows on hover.
export function MenuCard({ title, children }) {
  const pal = useLibraryPalette();
  return (
    <Box
      component="nav"
      aria-label={title}
      sx={(theme) => ({ p: 1.5, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: RADII_PX.dialog, bgcolor: pal.chip, border: `1px solid ${pal.border}`, maxHeight: `calc(100vh - ${SIZES.desktopFrame.stickyTop}px - ${theme.spacing(10)})` })}
    >
      <Typography component="h2" sx={{ textAlign: 'center', fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: pal.text, pt: 0.5, pb: 1.5, mb: 0.5, borderBottom: `1px solid ${pal.divider}` }}>{title}</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ...hoverScrollbarSx(pal.text) }}>{children}</Box>
    </Box>
  );
}

// One row of the card. The open row is darker and bold; `children` is what sits inside (name, count, progress bar).
export function MenuRow({ selected, onClick, children }) {
  const pal = useLibraryPalette();
  return (
    <ButtonBase
      onClick={onClick}
      aria-current={selected ? 'page' : undefined}
      sx={{ display: 'grid', gridTemplateColumns: '1fr', justifyItems: 'stretch', gap: 0.75, width: SIZES.fill, px: 1.5, py: 1.25, borderRadius: RADII_PX.card, textAlign: 'left', fontFamily: 'inherit', letterSpacing: LIB_TRACKING, color: selected ? pal.text : pal.muted, bgcolor: selected ? menuRowFill(pal) : 'transparent', '&:hover': { bgcolor: menuRowFill(pal) } }}
    >
      {children}
    </ButtonBase>
  );
}

// Name on the left and an optional count on the right, the usual content of a row.
export function MenuRowLabel({ label, count, selected }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
      <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: selected ? FONT_WEIGHTS.semibold : FONT_WEIGHTS.medium, color: 'inherit' }}>{label}</Typography>
      {count !== undefined && count !== '' && <Typography variant="caption" sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums', color: pal.muted }}>{count}</Typography>}
    </Box>
  );
}
