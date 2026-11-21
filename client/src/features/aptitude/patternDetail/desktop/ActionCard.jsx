import { Box, ButtonBase, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useLibraryCardSx } from '../../../dashboard/components/libraryCardStyles';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../../app/design/designTokens';

const DISABLED_OPACITY = 0.5;
const HOVER_BRIGHTNESS = 0.97;

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

// Clickable card of the right column (Practice, Test): the same grey card as the topics list on the left, with a
// coloured icon tile, the name and one status line.
export default function ActionCard({ icon, accent, name, meta, onClick, disabled }) {
  const cardSx = useLibraryCardSx();
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      aria-label={`${name}: ${meta}`}
      sx={{ ...cardSx, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5, width: SIZES.fill, textAlign: 'left', fontFamily: 'inherit', opacity: disabled ? DISABLED_OPACITY : 1, '&:hover': { filter: `brightness(${HOVER_BRIGHTNESS})` } }}
    >
      <Box sx={iconTileSx(accent)}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography sx={{ fontSize: FONT_SIZES.subheading, fontWeight: FONT_WEIGHTS.bold }}>{name}</Typography>
        <Typography noWrap sx={{ color: 'text.secondary', fontSize: FONT_SIZES.body }}>{meta}</Typography>
      </Box>
      <ChevronRightRoundedIcon aria-hidden sx={{ color: 'text.disabled' }} />
    </ButtonBase>
  );
}
