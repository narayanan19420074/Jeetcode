import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import AdminMobileDrawer from './AdminMobileDrawer';
import AdminMobileTopBar from './AdminMobileTopBar';
import AdminPhoneTheme from './AdminPhoneTheme';
import { useRememberMode } from '../../../components/AdminModeSwitch';
import { SIZES } from '../../../app/design/designTokens';

// Every page keeps one 16dp rhythm: the page's own Container padding is replaced by a single top and bottom margin
// (the bottom one also clears the home indicator), so no page starts lower or higher than another.
const mainSx = (theme) => ({
  flexGrow: 1,
  minWidth: SIZES.flexShrinkMinWidth,
  overflowX: 'auto',
  '& > .MuiContainer-root': {
    paddingTop: theme.spacing(2),
    paddingBottom: `calc(${theme.spacing(2)} + env(safe-area-inset-bottom))`,
  },
});

// Admin console on phones, built to Material Design: top app bar, modal navigation drawer, and the phone type scale and
// component sizes (AdminPhoneTheme) applied to every page.
export default function AdminMobileView({ unreadChats }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // The desktop switch records the mode; on phones this hook does it so the next sign-in still opens the console.
  useRememberMode('admin');

  return (
    <AdminPhoneTheme>
      <Box sx={{ minHeight: SIZES.viewportHeight, display: 'flex', flexDirection: 'column' }}>
        <AdminMobileTopBar unreadChats={unreadChats} onMenuClick={() => setDrawerOpen(true)} />
        <Box component="main" sx={mainSx}>
          <Outlet />
        </Box>
        <AdminMobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} unreadChats={unreadChats} />
      </Box>
    </AdminPhoneTheme>
  );
}
