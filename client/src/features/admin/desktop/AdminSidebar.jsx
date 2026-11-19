import { Drawer, Toolbar, Typography } from '@mui/material';
import AdminNavList from '../common/AdminNavList';
import { FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

const sidebarSx = {
  width: SIZES.adminSidebarWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': { width: SIZES.adminSidebarWidth, boxSizing: 'border-box', position: 'relative' },
};

// Always-visible sidebar for tablets and desktops.
export default function AdminSidebar({ unreadChats }) {
  return (
    <Drawer variant="permanent" sx={sidebarSx}>
      <Toolbar sx={{ px: 2.5, py: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: FONT_WEIGHTS.bold }}>
          Admin Console
        </Typography>
      </Toolbar>
      <AdminNavList unreadChats={unreadChats} />
    </Drawer>
  );
}
