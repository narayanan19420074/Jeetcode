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
export const ADMIN_NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: <DashboardRoundedIcon fontSize="small" />, end: true },
  { to: '/admin/users', label: 'Users', icon: <GroupRoundedIcon fontSize="small" /> },
  { to: '/admin/licenses', label: 'License Keys', icon: <VpnKeyRoundedIcon fontSize="small" /> },
  { to: '/admin/store', label: 'Store', icon: <StorefrontRoundedIcon fontSize="small" /> },
  { to: '/admin/problems', label: 'Problems', icon: <DescriptionRoundedIcon fontSize="small" /> },
  { to: '/admin/aptitude', label: 'Aptitude', icon: <PsychologyRoundedIcon fontSize="small" /> },
  { to: '/admin/support-chat', label: 'Live Chat', icon: <ChatRoundedIcon fontSize="small" />, badgeKey: 'chat' },
  { to: '/admin/feedback', label: 'Support Inbox', icon: <FeedbackRoundedIcon fontSize="small" /> },
  { to: '/admin/audit-log', label: 'Audit Log', icon: <HistoryRoundedIcon fontSize="small" /> },
];
