import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileBottomNav, { showMobileBottomNav } from '../components/MobileBottomNav';
import FreeAccessBanner from '../components/FreeAccessBanner';

export default function MainLayout() {
  const { pathname } = useLocation();
  const bottomNav = showMobileBottomNav(pathname);

  return (
    <Box
      sx={(t) => ({
        minHeight: '100vh',
        bgcolor: 'background.default',
        // Same GPay-style soft wash on phone and desktop
        backgroundImage: `linear-gradient(180deg, ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.12 : 0.14)} 0, transparent 300px)`,
        backgroundRepeat: 'no-repeat',
      })}
    >
      <FreeAccessBanner />
      <Navbar />
      <Box component="main" sx={{ pb: bottomNav ? { xs: 'calc(76px + env(safe-area-inset-bottom))', md: 0 } : 0 }}>
        <Outlet />
      </Box>
      {bottomNav && <MobileBottomNav />}
    </Box>
  );
}
