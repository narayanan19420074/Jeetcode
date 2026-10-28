import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import MobileBottomNav, { showMobileBottomNav } from './MobileBottomNav';
import FreeAccessBanner from './FreeAccessBanner';
import EmailVerifyBanner from './EmailVerifyBanner';
import FriendsRealtime from '../features/friends/friendsRealtime';
import NotificationsWatcher from '../features/notifications/NotificationsWatcher';

export default function MainLayout() {
  const { pathname } = useLocation();
  const bottomNav = showMobileBottomNav(pathname);
  // Pages with their own phone header (Problems) hide the top bar on phones. It stays mounted so the coin polling keeps running.
  const hideNavbarOnPhone = pathname === '/problems' || pathname.startsWith('/problems/');

  return (
    <Box
      sx={(t) => ({
        minHeight: '100vh',
        bgcolor: 'background.default',
        // Same GPay-style soft wash on phone and desktop
        backgroundImage: `linear-gradient(180deg, ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.08 : 0.07)} 0, transparent 280px)`,
        backgroundRepeat: 'no-repeat',
      })}
    >
      <FreeAccessBanner />
      <EmailVerifyBanner />
      <FriendsRealtime />
      <NotificationsWatcher />
      {hideNavbarOnPhone ? (
        <Box sx={{ display: { xs: 'none', md: 'contents' } }}>
          <Navbar />
        </Box>
      ) : (
        <Navbar />
      )}
      <Box component="main" sx={{ pb: bottomNav ? { xs: 'calc(76px + env(safe-area-inset-bottom))', md: 0 } : 0 }}>
        <Outlet />
      </Box>
      {bottomNav && <MobileBottomNav />}
    </Box>
  );
}
