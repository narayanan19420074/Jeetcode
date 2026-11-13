import { useState } from 'react';
import { Box } from '@mui/material';
import ProBadge from '../ProBadge';
import NavbarMenuGroup, { NavbarSubLink } from './NavbarMenuGroup';
import NavbarMenuRow from './NavbarMenuRow';
import { DRAWER_ITEMS, findActiveGroupLabel, isDrawerLinkActive, isGroupActive } from './drawerItems';

function DrawerGroup({ group, pathname, dashView, open, onToggle, onNavigate }) {
  return (
    <NavbarMenuGroup label={group.label} icon={group.icon} active={isGroupActive(group, pathname, dashView)} open={open} onToggle={onToggle}>
      {group.children.map((link) => (
        <NavbarSubLink key={link.label} to={link.to} label={link.label} active={isDrawerLinkActive(link, pathname, dashView)} onNavigate={onNavigate} />
      ))}
    </NavbarMenuGroup>
  );
}

function DrawerLink({ link, pathname, dashView, user, onNavigate }) {
  return (
    <NavbarMenuRow
      to={link.to}
      label={link.label}
      icon={link.icon}
      active={isDrawerLinkActive(link, pathname, dashView)}
      trailing={link.to === '/you' && user?.isPro ? <ProBadge /> : null}
      onNavigate={onNavigate}
    />
  );
}

// Menu entries of the phone drawer. One group is open at a time (it starts with the group of the current page), which keeps
// the menu short enough to see without scrolling.
export default function NavbarDrawerLinks({ pathname, dashView, user, isAuthenticated, onNavigate }) {
  const [openLabel, setOpenLabel] = useState(() => findActiveGroupLabel(pathname, dashView));
  const toggleGroup = (label) => setOpenLabel((current) => (current === label ? null : label));
  return (
    <Box>
      {DRAWER_ITEMS.filter((item) => isAuthenticated || !item.signedInOnly).map((item) =>
        item.children ? (
          <DrawerGroup key={item.label} group={item} pathname={pathname} dashView={dashView} open={openLabel === item.label} onToggle={() => toggleGroup(item.label)} onNavigate={onNavigate} />
        ) : (
          <DrawerLink key={item.label} link={item} pathname={pathname} dashView={dashView} user={user} onNavigate={onNavigate} />
        ),
      )}
    </Box>
  );
}
