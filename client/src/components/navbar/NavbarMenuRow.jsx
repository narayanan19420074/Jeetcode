import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../app/design/designTokens';
import { ACCENT, ACCENT_GRADIENT, TRACKING, libPal } from './navbarTheme';

const rowSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  py: 1,
  textDecoration: 'none',
  color: 'inherit',
  borderBottom: (theme) => `1px solid ${libPal(theme).divider}`,
  '&:last-of-type': { borderBottom: 'none' },
};

// The active row gets the accent gradient tile; other rows use the neutral tonal tile.
const tileSx = (active) => (theme) => ({
  width: SIZES.menuRowHeight,
  height: SIZES.menuRowHeight,
  borderRadius: RADII_PX.card,
  flexShrink: 0,
  display: 'grid',
  placeItems: 'center',
  ...(active ? { background: ACCENT_GRADIENT, color: COLOR_PALETTE.white } : { bgcolor: libPal(theme).chip, color: libPal(theme).chipText }),
});

const labelSx = (active) => ({
  flex: 1,
  minWidth: SIZES.flexShrinkMinWidth,
  fontWeight: active ? FONT_WEIGHTS.bold : FONT_WEIGHTS.regular,
  fontSize: FONT_SIZES.title,
  lineHeight: '24px',
  letterSpacing: TRACKING,
  color: active ? ACCENT : 'inherit',
});

// Row of the phone menu: same shape as the rows on the phone pages (tile, 1rem title, divider between rows).
export default function NavbarMenuRow({ to, label, icon: Icon, active, trailing, onNavigate }) {
  return (
    <Box component={RouterLink} to={to} onClick={onNavigate} aria-current={active ? 'page' : undefined} sx={rowSx}>
      <Box sx={tileSx(active)}>
        <Icon />
      </Box>
      <Typography noWrap sx={labelSx(active)}>
        {label}
      </Typography>
      {trailing}
    </Box>
  );
}
