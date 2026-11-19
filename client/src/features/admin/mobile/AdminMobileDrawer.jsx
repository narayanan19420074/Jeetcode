import { Drawer, Toolbar, Typography } from '@mui/material';
import AdminNavList from '../common/AdminNavList';
import { FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

const paperSx = { width: SIZES.drawerWidth, boxSizing: 'border-box' };

// Slide-in menu for phones, opened from the menu button in the top bar. It closes after every link tap.
export default function AdminMobileDrawer({ open, onClose, unreadChats }) {
  return (
    <Drawer variant="temporary" open={open} onClose={onClose} slotProps={{ paper: { sx: paperSx } }}>
      <Toolbar sx={{ px: 2.5, py: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: FONT_WEIGHTS.bold }}>
          Admin Console
        </Typography>
      </Toolbar>
      <AdminNavList unreadChats={unreadChats} onNavigate={onClose} />
    </Drawer>
  );
}
