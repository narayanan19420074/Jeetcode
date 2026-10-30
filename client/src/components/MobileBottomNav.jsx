import { useSelector } from 'react-redux';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { LIB_FONT, LIBRARY_PALETTE, isLibraryRoute } from '../features/dashboard/components/libraryStyle';
import { BRAND_ORANGE, BRAND_TEXT_LIGHT } from './BrandMark';

// Active tab uses the logo orange (pill tint on the Contest-banner orange, deeper orange icon for contrast on cream).
const PILL = '#E8590C';

const ITEMS = [
  { to: '/dashboard', label: 'Home', icon: HomeRoundedIcon },
  { to: '/problems', label: 'Problems', icon: FormatListBulletedRoundedIcon },
  { to: '/aptitude', label: 'Aptitude', icon: CalculateRoundedIcon },
  { to: '/prep', label: 'Companies', icon: BusinessRoundedIcon },
  { to: '/you', label: 'You', icon: PersonRoundedIcon },
];

// The code workspace needs the full phone height, so no bottom bar there.
export const showMobileBottomNav = (pathname) => !pathname.startsWith('/workspace');

const isActive = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);

// Phone-only tab bar (Home / Problems / Aptitude / Companies / You), like Google Pay.
export default function MobileBottomNav() {
  const { pathname, search } = useLocation();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  if (!isAuthenticated) return null;
  // The phone home uses a warm surface in light mode; the bar matches it.
  const library = isLibraryRoute(pathname, search);

  return (
    <Box
      component="nav"
      aria-label="Primary"
      sx={(t) => ({
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
        // Same surface as the page behind it (frosted), so the bar never looks like a separate colour block.
        bgcolor: library && t.palette.mode === 'light' ? LIBRARY_PALETTE.light.nav : alpha(t.palette.background.default, 0.88),
        ...(library && { fontFamily: LIB_FONT }),
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: library && t.palette.mode === 'light' ? 'none' : `1px solid ${alpha(t.palette.divider, 0.5)}`,
      })}
    >
      {ITEMS.map(({ to, label, icon: Icon }) => {
        const active = isActive(pathname, to);
        return (
          <Box
            key={to}
            component={RouterLink}
            to={to}
            aria-current={active ? 'page' : undefined}
            sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4, textDecoration: 'none', color: active ? 'text.primary' : 'text.secondary' }}
          >
            <Box
              sx={(t) => ({
                width: 64,
                height: 32,
                borderRadius: 99,
                display: 'grid',
                placeItems: 'center',
                color: active ? (t.palette.mode === 'dark' ? BRAND_ORANGE : BRAND_TEXT_LIGHT) : 'inherit',
                bgcolor: active ? alpha(PILL, t.palette.mode === 'dark' ? 0.24 : 0.16) : 'transparent',
                transition: 'background-color .2s',
              })}
            >
              <Icon sx={{ fontSize: 24 }} />
            </Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: active ? 800 : 600, lineHeight: 1.1, fontFamily: 'inherit' }}>{label}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}
