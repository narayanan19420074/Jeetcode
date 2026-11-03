import { useSelector } from 'react-redux';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import { LIB_FONT, LIBRARY_PALETTE, isLibraryRoute } from '../features/dashboard/components/libraryStyle';
import { BRAND_TEXT_DARK, BRAND_TEXT_LIGHT } from './BrandMark';
import { COLOR_PALETTE, RADII_PX, SIZES, MOTION } from '../app/design/designTokens';

// Active tab uses the logo orange (pill tint on the Contest-banner orange, deeper orange icon for contrast on cream).
const PILL = COLOR_PALETTE.orange[600];

const ITEMS = [
  { to: '/dashboard', label: 'Home', icon: HomeRoundedIcon },
  { to: '/problems', label: 'Problems', icon: FormatListBulletedRoundedIcon },
  { to: '/aptitude', label: 'Aptitude', icon: CalculateRoundedIcon },
  { to: '/prep', label: 'Companies', icon: BusinessRoundedIcon },
];

// The code workspace needs the full phone height, so no bottom bar there.
export const showMobileBottomNav = (pathname) => !pathname.startsWith('/workspace');

const isActive = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);

// The phone home uses a warm surface in light mode; the bar matches it. Elsewhere it is a frosted copy of the
// page surface, so the bar never looks like a separate colour block.
const barSx = (library) => (t) => ({
  display: { xs: 'flex', md: 'none' },
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: t.zIndex.appBar,
  justifyContent: 'space-around',
  px: 0.5,
  pt: 1,
  pb: 'calc(8px + env(safe-area-inset-bottom))',
  bgcolor: library && t.palette.mode === 'light' ? LIBRARY_PALETTE.light.nav : alpha(t.palette.background.default, 0.88),
  ...(library && { fontFamily: LIB_FONT }),
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderTop: library && t.palette.mode === 'light' ? 'none' : `1px solid ${alpha(t.palette.divider, 0.5)}`,
});

const tabIconSx = (active) => (t) => ({
  width: 64,
  height: 32,
  borderRadius: RADII_PX.pill,
  display: 'grid',
  placeItems: 'center',
  color: active ? (t.palette.mode === 'dark' ? BRAND_TEXT_DARK : BRAND_TEXT_LIGHT) : 'inherit',
  bgcolor: active ? alpha(PILL, t.palette.mode === 'dark' ? 0.24 : 0.16) : 'transparent',
  transition: `background-color ${MOTION.standard}ms`,
});

function NavTab({ to, label, icon: Icon, active }) {
  const tabSx = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, textDecoration: 'none', color: active ? 'text.primary' : 'text.secondary' };
  return (
    <Box component={RouterLink} to={to} aria-current={active ? 'page' : undefined} sx={tabSx}>
      <Box sx={tabIconSx(active)}>
        <Icon sx={{ fontSize: SIZES.iconSize.medium }} />
      </Box>
      <Typography variant="micro" sx={{ fontWeight: active ? 'fontWeightBold' : 'fontWeightSemibold', lineHeight: 1.1, fontFamily: 'inherit' }}>{label}</Typography>
    </Box>
  );
}

// Phone-only tab bar (Home / Problems / Aptitude / Companies), like Google Pay.
export default function MobileBottomNav() {
  const { pathname, search } = useLocation();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  if (!isAuthenticated) return null;

  return (
    <Box component="nav" aria-label="Primary" sx={barSx(isLibraryRoute(pathname, search))}>
      {ITEMS.map((item) => (
        <NavTab key={item.to} {...item} active={isActive(pathname, item.to)} />
      ))}
    </Box>
  );
}
