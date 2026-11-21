import { Box, ButtonBase, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useLibraryPalette, LIB_TRACKING } from '../../../dashboard/components/libraryStyle';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES, withAlpha } from '../../../../app/design/designTokens';

const HOVER_ALPHA = 0.05;
const DISABLED_OPACITY = 0.5;

const iconTileSx = (accent) => ({
  width: SIZES.controlHeight.desktop,
  height: SIZES.controlHeight.desktop,
  flexShrink: 0,
  display: 'grid',
  placeItems: 'center',
  borderRadius: RADII_PX.card,
  bgcolor: accent,
  color: COLOR_PALETTE.white,
});

// One row of the topic actions card: coloured icon tile, the name and one status line. It looks like a row of the
// Topics list on the left (same padding, radius and hover).
export default function ActionRow({ icon, accent, name, meta, onClick, disabled }) {
  const pal = useLibraryPalette();
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      aria-label={`${name}: ${meta}`}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5, width: SIZES.fill, px: 1.5, py: 1.25, borderRadius: RADII_PX.card, textAlign: 'left', fontFamily: 'inherit', letterSpacing: LIB_TRACKING, color: pal.text, opacity: disabled ? DISABLED_OPACITY : 1, '&:hover': { bgcolor: withAlpha(pal.text, HOVER_ALPHA) } }}
    >
      <Box sx={iconTileSx(accent)}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.semibold, color: 'inherit' }}>{name}</Typography>
        <Typography noWrap sx={{ color: pal.muted, fontSize: FONT_SIZES.body }}>{meta}</Typography>
      </Box>
      <ChevronRightRoundedIcon aria-hidden sx={{ color: pal.muted }} />
    </ButtonBase>
  );
}
