import { NavLink, Outlet } from 'react-router-dom';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Toolbar } from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AdminNavbar from './AdminNavbar';

const SIDEBAR_WIDTH = 240;

// One entry per admin section. `end` matches only the exact index route
// so /admin doesn't keep the Overview link highlighted while on /admin/users.
const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: <DashboardRoundedIcon fontSize="small" />, end: true },
  { to: '/admin/users', label: 'Users', icon: <GroupRoundedIcon fontSize="small" /> },
  { to: '/admin/licenses', label: 'License Keys', icon: <VpnKeyRoundedIcon fontSize="small" /> },
  { to: '/admin/problems', label: 'Problems', icon: <DescriptionRoundedIcon fontSize="small" /> },
  { to: '/admin/aptitude', label: 'Aptitude', icon: <PsychologyRoundedIcon fontSize="small" /> },
  { to: '/admin/audit-log', label: 'Audit Log', icon: <HistoryRoundedIcon fontSize="small" /> },
];

// Full shell for every /admin/* page. This is now a standalone layout —
// it is NOT nested inside the client's MainLayout/Navbar (see App.jsx).
// AdminNavbar on top replaces the client navbar entirely: no
// Dashboard/Problems/Prep/Explore links, nothing that routes outside
// /admin/*. The sidebar below is the only in-panel navigation.
export default function AdminLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AdminNavbar />

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Drawer
          variant="permanent"
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: SIDEBAR_WIDTH, boxSizing: 'border-box', position: 'relative' },
          }}
        >
          <Toolbar sx={{ px: 2.5, py: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Admin Console
            </Typography>
          </Toolbar>
          <List sx={{ px: 1 }}>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                end={item.end}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.active': {
                    bgcolor: 'action.selected',
                    fontWeight: 700,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
              </ListItemButton>
            ))}
          </List>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
