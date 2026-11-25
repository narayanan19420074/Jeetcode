import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Badge, Box, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, alpha } from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AdminBrand from '../common/AdminBrand';
import { groupAdminNavItems, isAdminItemActive, unreadBadgeFor } from '../common/adminNavItems';
import { FONT_SIZES, FONT_WEIGHTS, RADII, RADII_PX, SIZES } from '../../../app/design/designTokens';

const SELECTED_TINT = { light: 0.16, dark: 0.24 };
// Admins leave the console for the learner app from here; the top bar has no room for the User | Admin switch.
const USER_MODE_ITEM = { to: '/dashboard', label: 'Switch to user mode', icon: PersonRoundedIcon };

const paperSx = {
  width: SIZES.drawerWidth,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: `0 ${RADII.dialog}px ${RADII.dialog}px 0`,
};

// One destination: 56dp row, pill indicator behind the open section (Material navigation drawer).
const itemSx = (theme) => ({
  minHeight: SIZES.adminDrawerRow,
  px: 2,
  borderRadius: RADII_PX.pill,
  '&.Mui-selected, &.Mui-selected:hover': {
    color: 'primary.main',
    bgcolor: alpha(theme.palette.primary.main, SELECTED_TINT[theme.palette.mode]),
  },
});

function DrawerItem({ item, selected = false, badge = 0, onNavigate }) {
  const Icon = item.icon;
  return (
    <ListItemButton component={RouterLink} to={item.to} selected={selected} onClick={onNavigate} aria-current={selected ? 'page' : undefined} sx={itemSx}>
      <ListItemIcon sx={{ minWidth: SIZES.adminNavIconWidth, color: 'inherit' }}>
        <Badge color="error" badgeContent={badge} invisible={!badge}>
          <Icon />
        </Badge>
      </ListItemIcon>
      <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontSize: FONT_SIZES.body, fontWeight: selected ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium } } }} />
    </ListItemButton>
  );
}

function GroupHeading({ children }) {
  return (
    <Typography variant="caption" component="div" sx={{ px: 2, minHeight: SIZES.touchTarget, display: 'flex', alignItems: 'center', color: 'text.secondary', fontWeight: FONT_WEIGHTS.medium }}>
      {children}
    </Typography>
  );
}

function DrawerHeader() {
  return (
    <Box sx={(theme) => ({ px: 3, pt: `calc(env(safe-area-inset-top) + ${theme.spacing(2)})`, pb: 1 })}>
      <AdminBrand />
      <Typography variant="caption" color="text.secondary">Admin Console</Typography>
    </Box>
  );
}

function DrawerSections({ pathname, unreadChats, onNavigate }) {
  return groupAdminNavItems().map((group, index) => (
    <Box key={group.label}>
      {index > 0 && <Divider sx={{ my: 1 }} />}
      <GroupHeading>{group.label}</GroupHeading>
      {group.items.map((item) => (
        <DrawerItem key={item.to} item={item} selected={isAdminItemActive(pathname, item)} badge={unreadBadgeFor(item, unreadChats)} onNavigate={onNavigate} />
      ))}
    </Box>
  ));
}

// Modal navigation drawer opened from the top app bar's menu icon: sections in groups, user-mode switch pinned at the bottom.
export default function AdminMobileDrawer({ open, onClose, unreadChats }) {
  const { pathname } = useLocation();
  return (
    <Drawer open={open} onClose={onClose} slotProps={{ paper: { sx: paperSx } }}>
      <DrawerHeader />
      <List component="nav" aria-label="Admin sections" sx={{ flex: 1, overflowY: 'auto', px: 1.5 }}>
        <DrawerSections pathname={pathname} unreadChats={unreadChats} onNavigate={onClose} />
      </List>
      <Divider />
      <List sx={(theme) => ({ px: 1.5, pb: `calc(env(safe-area-inset-bottom) + ${theme.spacing(1)})` })}>
        <DrawerItem item={USER_MODE_ITEM} onNavigate={onClose} />
      </List>
    </Drawer>
  );
}
