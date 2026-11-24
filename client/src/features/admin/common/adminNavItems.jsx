import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import FeedbackRoundedIcon from '@mui/icons-material/FeedbackRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';

// One entry per admin section. `end` matches only the exact index route
// so /admin doesn't keep the Overview link highlighted while on /admin/users.
// `tab` marks the four sections that get a slot in the phone tab bar; the others open from its "More" sheet.
export const ADMIN_NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: DashboardRoundedIcon, end: true, tab: true },
  { to: '/admin/users', label: 'Users', icon: GroupRoundedIcon, tab: true },
  { to: '/admin/licenses', label: 'License Keys', icon: VpnKeyRoundedIcon },
  { to: '/admin/store', label: 'Store', icon: StorefrontRoundedIcon },
  { to: '/admin/problems', label: 'Problems', icon: DescriptionRoundedIcon, tab: true },
  { to: '/admin/aptitude', label: 'Aptitude', icon: PsychologyRoundedIcon },
  { to: '/admin/support-chat', label: 'Live Chat', icon: ChatRoundedIcon, badgeKey: 'chat', tab: true },
  { to: '/admin/feedback', label: 'Support Inbox', icon: FeedbackRoundedIcon },
  { to: '/admin/audit-log', label: 'Audit Log', icon: HistoryRoundedIcon },
];

export const ADMIN_TAB_ITEMS = ADMIN_NAV_ITEMS.filter((item) => item.tab);
export const ADMIN_MORE_ITEMS = ADMIN_NAV_ITEMS.filter((item) => !item.tab);

// Only the Live Chat section carries a badge: admins must notice waiting customers without opening it.
export const unreadBadgeFor = (item, unreadChats) => (item.badgeKey === 'chat' ? unreadChats : 0);

const withoutTrailingSlash = (pathname) => pathname.replace(/\/+$/, '') || '/';

// Same rule as NavLink's `end`, for the phone tab bar and sheet that highlight sections themselves.
export function isAdminItemActive(pathname, { to, end }) {
  const path = withoutTrailingSlash(pathname);
  return end ? path === to : path === to || path.startsWith(`${to}/`);
}
