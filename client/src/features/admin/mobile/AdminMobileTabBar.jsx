import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import { NavTab, bottomNavBarSx } from '../../../components/MobileBottomNav';
import { ADMIN_MORE_ITEMS, ADMIN_TAB_ITEMS, isAdminItemActive, unreadBadgeFor } from '../common/adminNavItems';

// Bottom tab bar of the admin console on phones: the same bar the learner app uses (blue pill behind the active icon).
// Four main sections plus "More", which is highlighted while one of the sections inside it is open.
export default function AdminMobileTabBar({ unreadChats, onMoreClick }) {
  const { pathname } = useLocation();
  const isMoreActive = ADMIN_MORE_ITEMS.some((item) => isAdminItemActive(pathname, item));

  return (
    <Box component="nav" aria-label="Admin sections" sx={bottomNavBarSx(true)}>
      {ADMIN_TAB_ITEMS.map((item) => (
        <NavTab key={item.to} to={item.to} label={item.label} icon={item.icon} active={isAdminItemActive(pathname, item)} badge={unreadBadgeFor(item, unreadChats)} />
      ))}
      <NavTab label="More" icon={MoreHorizRoundedIcon} active={isMoreActive} onClick={onMoreClick} />
    </Box>
  );
}
