import { NavLink } from 'react-router-dom';
import { Badge, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { ADMIN_NAV_ITEMS } from './adminNavItems';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const linkSx = {
  borderRadius: RADII_PX.card,
  mb: 0.5,
  minHeight: SIZES.touchTarget,
  '&.active': { bgcolor: 'action.selected', fontWeight: FONT_WEIGHTS.bold },
};

const labelSlotProps = { primary: { sx: { fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.body } } };

function NavItemIcon({ item, unreadChats }) {
  if (item.badgeKey !== 'chat') return item.icon;
  return (
    <Badge color="error" badgeContent={unreadChats} invisible={!unreadChats}>
      {item.icon}
    </Badge>
  );
}

function AdminNavItem({ item, unreadChats, onNavigate }) {
  return (
    <ListItemButton component={NavLink} to={item.to} end={item.end} onClick={onNavigate} sx={linkSx}>
      <ListItemIcon sx={{ minWidth: SIZES.adminNavIconWidth }}>
        <NavItemIcon item={item} unreadChats={unreadChats} />
      </ListItemIcon>
      <ListItemText primary={item.label} slotProps={labelSlotProps} />
    </ListItemButton>
  );
}

// Section links shared by the desktop sidebar and the phone menu. `onNavigate` lets the phone menu close after a tap.
export default function AdminNavList({ unreadChats, onNavigate }) {
  return (
    <List component="nav" aria-label="Admin sections" sx={{ px: 1 }}>
      {ADMIN_NAV_ITEMS.map((item) => (
        <AdminNavItem key={item.to} item={item} unreadChats={unreadChats} onNavigate={onNavigate} />
      ))}
    </List>
  );
}
