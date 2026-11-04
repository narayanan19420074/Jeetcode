import { alpha } from '@mui/material';
import { COLOR_PALETTE, SIZES } from '../../app/design/designTokens';
import { LIBRARY_PALETTE } from '../../features/dashboard/components/libraryStyle';

// Phones use the same indigo accent and gradient as the phone pages (Home, Problems, You, Settings).
export const ACCENT = COLOR_PALETTE.indigo[500];
export const TRACKING = '0.03em';
export const ACCENT_GRADIENT = `linear-gradient(135deg, ${ACCENT}, color-mix(in srgb, ${ACCENT} 60%, ${COLOR_PALETTE.black}))`;

// Library palette for the phone menu (light and dark variants).
export const libPal = (theme) => LIBRARY_PALETTE[theme.palette.mode === 'dark' ? 'dark' : 'light'];

const tintedButtonSx = (theme) => ({
  color: libPal(theme).text,
  bgcolor: libPal(theme).player,
  '&:hover': { bgcolor: libPal(theme).player, filter: 'brightness(0.97)' },
});

const phoneIconButtonSize = { width: SIZES.iconButton.mobile, height: SIZES.iconButton.mobile };

// Phone action buttons, tinted with the shared accent (same as the buttons on the phone pages).
export const phoneBtnSx = (theme) => ({
  [theme.breakpoints.down('md')]: { ...phoneIconButtonSize, ...tintedButtonSx(theme) },
});

export const hamburgerSx = (theme) => ({
  display: { xs: 'inline-flex', md: 'none' },
  ...phoneIconButtonSize,
  ...tintedButtonSx(theme),
});

export const footerIconSx = (theme) => ({
  width: SIZES.touchTarget,
  height: SIZES.touchTarget,
  ...tintedButtonSx(theme),
});

// Phones: solid page background (pure white in light mode), no translucency.
// Library pages in light mode drop the bottom line because the page itself is white.
export const appBarSx = (libraryBar) => (theme) => ({
  [theme.breakpoints.down('md')]: {
    backgroundColor: theme.palette.background.default,
    borderBottom: libraryBar && theme.palette.mode === 'light' ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.4)}`,
  },
});

export const toolbarSx = (theme) => ({
  gap: { xs: 1, sm: 2 },
  [theme.breakpoints.down('md')]: { gap: 1, px: 2, minHeight: SIZES.navbarHeightPhone },
});
