import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery } from '@mui/material';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './desktop/AdminSidebar';
import AdminMobileDrawer from './mobile/AdminMobileDrawer';
import useUnreadChats from './common/useUnreadChats';
import { MEDIA_QUERIES } from '../../app/design/designTokens';

// Full shell for every /admin/* page. This is a standalone layout —
// it is NOT nested inside the client's MainLayout/Navbar (see App.jsx).
// AdminNavbar on top replaces the client navbar entirely: nothing here
// routes outside /admin/*. Tablets and desktops get a permanent sidebar;
// phones get the same links in a slide-in menu opened from the top bar.
export default function AdminLayout() {
  const isPhone = useMediaQuery(MEDIA_QUERIES.belowMd);
  const [menuOpen, setMenuOpen] = useState(false);
  const unreadChats = useUnreadChats();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AdminNavbar showMenuButton={isPhone} unreadChats={unreadChats} onMenuClick={() => setMenuOpen(true)} />

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {isPhone ? (
          <AdminMobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} unreadChats={unreadChats} />
        ) : (
          <AdminSidebar unreadChats={unreadChats} />
        )}

        {/* overflowX lets the content column shrink to the screen; wide tables scroll inside it instead of widening the page. */}
        <Box component="main" sx={{ flexGrow: 1, overflowX: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
