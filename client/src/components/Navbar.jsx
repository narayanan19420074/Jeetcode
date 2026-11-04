import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { AppBar, Box, Toolbar } from '@mui/material';
import { toggleThemeMode } from '../app/uiSlice';
import { isLibraryRoute } from '../features/dashboard/components/libraryStyle';
import NotificationBell from '../features/notifications/NotificationBell';
import ActivateLicenseModal from './ActivateLicenseModal';
import NavbarAccountMenu from './navbar/NavbarAccountMenu';
import NavbarDesktopLinks from './navbar/NavbarDesktopLinks';
import NavbarDrawer from './navbar/NavbarDrawer';
import NavbarStatusChips from './navbar/NavbarStatusChips';
import { BrandLink, HamburgerButton, SignInButton, ThemeToggleButton } from './navbar/NavbarControls';
import { appBarSx, toolbarSx } from './navbar/navbarTheme';
import useCoinBalanceSync from './navbar/useCoinBalanceSync';
import useNavbarActions from './navbar/useNavbarActions';

function SignedInControls({ user, actions }) {
  return (
    <>
      <NotificationBell />
      <NavbarAccountMenu user={user} actions={actions} />
    </>
  );
}

export default function Navbar() {
  const dispatch = useDispatch();
  const { pathname, search } = useLocation();
  const mode = useSelector((state) => state.ui.mode);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const actions = useNavbarActions();
  const coins = user?.coins ?? 0;
  const toggleTheme = () => dispatch(toggleThemeMode());
  useCoinBalanceSync({ isAuthenticated, pathname, coins });

  return (
    <AppBar position="sticky" elevation={0} sx={appBarSx(isLibraryRoute(pathname, search))}>
      <Toolbar sx={toolbarSx}>
        <HamburgerButton onClick={actions.openDrawer} />
        <BrandLink isAuthenticated={isAuthenticated} />
        <NavbarDesktopLinks pathname={pathname} />
        <Box sx={{ flexGrow: 1 }} />
        {isAuthenticated && <NavbarStatusChips user={user} coins={coins} />}
        <ThemeToggleButton mode={mode} onToggle={toggleTheme} />
        {isAuthenticated ? <SignedInControls user={user} actions={actions} /> : <SignInButton />}
      </Toolbar>
      <NavbarDrawer
        open={actions.drawerOpen}
        pathname={pathname}
        dashView={new URLSearchParams(search).get('view')}
        mode={mode}
        isAuthenticated={isAuthenticated}
        user={user}
        coins={coins}
        actions={actions}
        onToggleTheme={toggleTheme}
      />
      <ActivateLicenseModal open={actions.licenseModalOpen} onClose={actions.closeLicenseModal} />
    </AppBar>
  );
}
