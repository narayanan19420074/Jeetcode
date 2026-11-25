import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import AdminNavbar from '../AdminNavbar';
import AdminSidebar from './AdminSidebar';
import { SIZES } from '../../../app/design/designTokens';

// Tablets and desktops: top bar plus a permanent sidebar.
export default function AdminDesktopView({ unreadChats }) {
  return (
    <Box sx={{ minHeight: SIZES.viewportHeight, display: 'flex', flexDirection: 'column' }}>
      <AdminNavbar />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <AdminSidebar unreadChats={unreadChats} />
        {/* overflowX lets the content column shrink to the screen; wide tables scroll inside it instead of widening the page. */}
        <Box component="main" sx={{ flexGrow: 1, overflowX: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
