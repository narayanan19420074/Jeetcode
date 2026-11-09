import { useSelector } from 'react-redux';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import { LIB_FONT, isLibraryRoute } from '../features/dashboard/components/libraryStyle';
import { RADII_PX, SIZES, MOTION } from '../app/design/designTokens';
import { navActiveColor } from './navbar/navLinkStyles';

const ITEMS = [
  { to: '/dashboard', label: 'Home', icon: HomeRoundedIcon },
  { to: '/problems', label: 'Problems', icon: FormatListBulletedRoundedIcon },
  { to: '/aptitude', label: 'Aptitude', icon: CalculateRoundedIcon },
  { to: '/community', label: 'Community', icon: ForumRoundedIcon },
];

// The code workspace needs the full phone height, and an open community post has its own action bar at the bottom,
// so neither shows the tab bar.
export const showMobileBottomNav = (pathname) => !pathname.startsWith('/workspace') && !pathname.startsWith('/community/');

const isActive = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);

// Solid page surface (pure white in light mode) with a hairline on top, so the bar never looks like a separate colour block.
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
  bgcolor: t.palette.background.default,
  ...(library && { fontFamily: LIB_FONT }),
  borderTop: `1px solid ${t.palette.divider}`,
});

// Active tab uses the navigation blue, the same blue as the active desktop link, for the icon and the pill tint.
const tabIconSx = (active) => (t) => ({
  width: SIZES.bottomNavTabIcon.width,
  height: SIZES.bottomNavTabIcon.height,
  borderRadius: RADII_PX.pill,
  display: 'grid',
  placeItems: 'center',
  color: active ? navActiveColor(t) : 'inherit',
  bgcolor: active ? alpha(navActiveColor(t), t.palette.mode === 'dark' ? 0.24 : 0.16) : 'transparent',
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

// Phone-only tab bar (Home / Problems / Aptitude / Community), like Google Pay.
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
