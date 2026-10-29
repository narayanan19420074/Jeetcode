import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import MobileBottomNav, { showMobileBottomNav } from './MobileBottomNav';
import FreeAccessBanner from './FreeAccessBanner';
import EmailVerifyBanner from './EmailVerifyBanner';
import FriendsRealtime from '../features/friends/friendsRealtime';
import NotificationsWatcher from '../features/notifications/NotificationsWatcher';
import { LIBRARY_PALETTE, isLibraryRoute } from '../features/dashboard/components/libraryStyle';

export default function MainLayout() {
  const { pathname, search } = useLocation();
  const bottomNav = showMobileBottomNav(pathname);
  const libraryLook = isLibraryRoute(pathname, search);
  // Pages with their own phone header (Problems, Aptitude levels, Companies, You, Settings, Workspace, Store, Contest, Explore, Friends, Leaderboard, Study Plan) hide the top bar on phones. It stays mounted so the coin polling keeps running.
  const hideNavbarOnPhone = pathname === '/problems' || pathname.startsWith('/problems/') || ['/aptitude', '/prep', '/you', '/settings'].includes(pathname.replace(/\/+$/, '')) || pathname.startsWith('/settings/') || pathname.startsWith('/workspace/') || pathname === '/store' || (pathname.replace(/\/+$/, '') === '/dashboard' && ['contest', 'explore', 'friends', 'leaderboard', 'plans', 'quests'].includes(new URLSearchParams(search).get('view')));

  return (
    <Box
      sx={(t) => ({
        minHeight: '100vh',
        // Phone home (light mode) is a flat warm page; everything else keeps the soft wash on phone and desktop.
        bgcolor: libraryLook && t.palette.mode === 'light' ? { xs: LIBRARY_PALETTE.light.bg, md: 'background.default' } : 'background.default',
        backgroundImage: libraryLook && t.palette.mode === 'light'
          ? { xs: 'none', md: `linear-gradient(180deg, ${alpha(t.palette.primary.main, 0.07)} 0, transparent 280px)` }
          : `linear-gradient(180deg, ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.08 : 0.07)} 0, transparent 280px)`,
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
