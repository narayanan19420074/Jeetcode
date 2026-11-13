import { Box, ButtonBase, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AppCard from '../../../../components/ui/AppCard';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../../app/design/designTokens';

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

// Clickable card of the right column (Practice, Test): coloured icon tile, name and one status line.
export default function ActionCard({ icon, accent, name, meta, onClick, disabled }) {
  return (
    <ButtonBase onClick={onClick} disabled={disabled} aria-label={`${name}: ${meta}`} sx={{ display: 'block', width: SIZES.fill, textAlign: 'left', borderRadius: RADII_PX.card, fontFamily: 'inherit', opacity: disabled ? 0.5 : 1 }}>
      <AppCard interactive sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={iconTileSx(accent)}>{icon}</Box>
        <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
          <Typography sx={{ fontSize: FONT_SIZES.subheading, fontWeight: FONT_WEIGHTS.bold }}>{name}</Typography>
          <Typography noWrap sx={{ color: 'text.secondary', fontSize: FONT_SIZES.body }}>{meta}</Typography>
        </Box>
        <ChevronRightRoundedIcon aria-hidden sx={{ color: 'text.disabled' }} />
      </AppCard>
    </ButtonBase>
  );
}
