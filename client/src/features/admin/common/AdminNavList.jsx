import { NavLink } from 'react-router-dom';
import { Badge, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { ADMIN_NAV_ITEMS, unreadBadgeFor } from './adminNavItems';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const linkSx = {
  borderRadius: RADII_PX.card,
  mb: 0.5,
  minHeight: SIZES.touchTarget,
  '&.active': { bgcolor: 'action.selected', fontWeight: FONT_WEIGHTS.bold },
};

const labelSlotProps = { primary: { sx: { fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.body } } };

function NavItemIcon({ item, unreadChats }) {
  const Icon = item.icon;
  const badgeCount = unreadBadgeFor(item, unreadChats);
  return (
    <Badge color="error" badgeContent={badgeCount} invisible={!badgeCount}>
      <Icon fontSize="small" />
    </Badge>
  );
}

function AdminNavItem({ item, unreadChats }) {
  return (
    <ListItemButton component={NavLink} to={item.to} end={item.end} sx={linkSx}>
      <ListItemIcon sx={{ minWidth: SIZES.adminNavIconWidth }}>
        <NavItemIcon item={item} unreadChats={unreadChats} />
      </ListItemIcon>
      <ListItemText primary={item.label} slotProps={labelSlotProps} />
    </ListItemButton>
  );
}

// Section links of the desktop sidebar. Phones use the tab bar and "More" sheet instead.
export default function AdminNavList({ unreadChats }) {
  return (
    <List component="nav" aria-label="Admin sections" sx={{ px: 1 }}>
      {ADMIN_NAV_ITEMS.map((item) => (
        <AdminNavItem key={item.to} item={item} unreadChats={unreadChats} />
      ))}
    </List>
  );
}
