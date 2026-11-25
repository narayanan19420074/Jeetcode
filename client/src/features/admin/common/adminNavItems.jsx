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
// `group` is the heading the phone navigation drawer lists the section under (sections of a group are adjacent).
export const ADMIN_NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: DashboardRoundedIcon, end: true, group: 'Manage' },
  { to: '/admin/users', label: 'Users', icon: GroupRoundedIcon, group: 'Manage' },
  { to: '/admin/licenses', label: 'License Keys', icon: VpnKeyRoundedIcon, group: 'Manage' },
  { to: '/admin/store', label: 'Store', icon: StorefrontRoundedIcon, group: 'Manage' },
  { to: '/admin/problems', label: 'Problems', icon: DescriptionRoundedIcon, group: 'Content' },
  { to: '/admin/aptitude', label: 'Aptitude', icon: PsychologyRoundedIcon, group: 'Content' },
  { to: '/admin/support-chat', label: 'Live Chat', icon: ChatRoundedIcon, badgeKey: 'chat', group: 'Support' },
  { to: '/admin/feedback', label: 'Support Inbox', icon: FeedbackRoundedIcon, group: 'Support' },
  { to: '/admin/audit-log', label: 'Audit Log', icon: HistoryRoundedIcon, group: 'System' },
];

// Only Live Chat carries a badge: admins must notice waiting customers without opening the section.
export const unreadBadgeFor = (item, unreadChats) => (item.badgeKey === 'chat' ? unreadChats : 0);

export function groupAdminNavItems(items = ADMIN_NAV_ITEMS) {
  return items.reduce((groups, item) => {
    const current = groups[groups.length - 1];
    if (current?.label === item.group) current.items.push(item);
    else groups.push({ label: item.group, items: [item] });
    return groups;
  }, []);
}

const withoutTrailingSlash = (pathname) => pathname.replace(/\/+$/, '') || '/';

// Same rule as NavLink's `end`, for the phone drawer that marks the open section itself.
export function isAdminItemActive(pathname, { to, end }) {
  const path = withoutTrailingSlash(pathname);
  return end ? path === to : path === to || path.startsWith(`${to}/`);
}
