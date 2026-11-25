import { AppBar, Box, Toolbar } from '@mui/material';
import AdminAccountMenu from './common/AdminAccountMenu';
import AdminBrand from './common/AdminBrand';
import ThemeModeButton from './common/ThemeModeButton';
import { AdminModeToggle } from '../../components/AdminModeSwitch';

// Desktop top bar. Deliberately NOT the client Navbar: no Dashboard/Problems/Prep links, no streak chip, no Pro badge.
// Phones use mobile/AdminMobileTopBar instead.
export default function AdminNavbar() {
  return (
    <AppBar position="sticky" elevation={0} color="default" sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 2 }}>
        <AdminBrand />
        <Box sx={{ flexGrow: 1 }} />
        <AdminModeToggle />
        <ThemeModeButton />
        <AdminAccountMenu />
      </Toolbar>
    </AppBar>
  );
}
