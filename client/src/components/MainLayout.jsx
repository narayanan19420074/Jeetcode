import { useLayoutEffect } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import MobileBottomNav, { showMobileBottomNav } from './MobileBottomNav';
import FreeAccessBanner from './FreeAccessBanner';
import EmailVerifyBanner from './EmailVerifyBanner';
import FriendsRealtime from '../features/friends/friendsRealtime';
import NotificationsWatcher from '../features/notifications/NotificationsWatcher';
import { LIBRARY_PAGE_PATHS, LIBRARY_PALETTE, isLibraryRoute } from '../features/dashboard/components/libraryStyle';
import { DesktopLookProvider, isDashboardPath, usesDesktopLook } from '../features/dashboard/desktop/desktopLook';

// Pages with their own phone header hide the top bar on phones. The bar stays mounted so the coin polling keeps running.
const PHONE_HEADER_PATHS = LIBRARY_PAGE_PATHS;
const PHONE_HEADER_DASHBOARD_VIEWS = ['contest', 'explore', 'friends', 'leaderboard', 'plans', 'quests'];
const APTITUDE_LEVEL_PATH = /^\/aptitude\/[^/]+(\/practice(\/[^/]+)?)?\/?$/;

const hasPhoneHeaderOnDashboard = (pathname, search) =>
  isDashboardPath(pathname) && PHONE_HEADER_DASHBOARD_VIEWS.includes(new URLSearchParams(search).get('view'));

const hidesNavbarOnPhone = (pathname, search) =>
  pathname === '/problems' ||
  pathname.startsWith('/problems/') ||
  PHONE_HEADER_PATHS.includes(pathname.replace(/\/+$/, '')) ||
  APTITUDE_LEVEL_PATH.test(pathname) ||
  pathname.startsWith('/settings/') ||
  pathname.startsWith('/job-profile/') ||
  pathname.startsWith('/workspace/') ||
  pathname === '/store' ||
  pathname === '/community' ||
  pathname.startsWith('/community/') ||
  hasPhoneHeaderOnDashboard(pathname, search);

// Every page change starts at the top. The instant jump also cancels any smooth scroll that is
// still running (for example the Aptitude map centring on the current level), so it cannot
// carry over to the next page. A layout effect runs before the new page's own effects, so pages
// that scroll on mount (like the Aptitude map) still work.
function useScrollToTopOnNavigate(pathname, hash) {
  useLayoutEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
}

// Phone home (light mode) is a flat warm page. The desktop dashboard, Problems page and Store use the same cream page.
// Every other page keeps the soft wash.
function pageBackgroundSx(t, { libraryLook, desktopLook }) {
  const isLight = t.palette.mode === 'light';
  const wash = `linear-gradient(180deg, ${alpha(t.palette.primary.main, isLight ? 0.07 : 0.08)} 0, transparent 280px)`;
  const cream = LIBRARY_PALETTE.light.bg;
  if (!isLight) return { bgcolor: 'background.default', backgroundImage: wash, backgroundRepeat: 'no-repeat' };
  return {
    bgcolor: { xs: libraryLook ? cream : 'background.default', md: desktopLook ? cream : 'background.default' },
    backgroundImage: { xs: libraryLook ? 'none' : wash, md: desktopLook ? 'none' : wash },
    backgroundRepeat: 'no-repeat',
  };
}

function TopBar({ hiddenOnPhone }) {
  if (!hiddenOnPhone) return <Navbar />;
  return (
    <Box sx={{ display: { xs: 'none', md: 'contents' } }}>
      <Navbar />
    </Box>
  );
}

export default function MainLayout() {
  const { pathname, search, hash } = useLocation();
  const isDesktop = useMediaQuery(useTheme().breakpoints.up('md'));
  useScrollToTopOnNavigate(pathname, hash);

  const bottomNav = showMobileBottomNav(pathname);
  const pageLook = { libraryLook: isLibraryRoute(pathname, search), desktopLook: usesDesktopLook(pathname) };

  return (
    <Box sx={(t) => ({ minHeight: '100vh', ...pageBackgroundSx(t, pageLook) })}>
      <DesktopLookProvider enabled={pageLook.desktopLook && isDesktop}>
        <FreeAccessBanner />
        <EmailVerifyBanner />
        <FriendsRealtime />
        <NotificationsWatcher />
        <TopBar hiddenOnPhone={hidesNavbarOnPhone(pathname, search)} />
        <Box component="main" sx={{ pb: bottomNav ? { xs: 'calc(76px + env(safe-area-inset-bottom))', md: 0 } : 0 }}>
          <Outlet />
        </Box>
        {bottomNav && <MobileBottomNav />}
      </DesktopLookProvider>
    </Box>
  );
}
