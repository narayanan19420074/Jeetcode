import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';

// Core product flows: inline on desktop.
export const PRIMARY_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardRoundedIcon },
  { to: '/problems', label: 'Problems', icon: FormatListBulletedRoundedIcon },
  { to: '/aptitude', label: 'Aptitude', icon: CalculateRoundedIcon },
  { to: '/community', label: 'Community', icon: ForumRoundedIcon },
];

// Everything else on desktop: grouped under "Explore".
// (Learn topics are reached through Aptitude Practice -> a pattern.)
export const EXPLORE_LINKS = [
  { to: '/prep', label: 'Companies', icon: BusinessRoundedIcon },
  { to: '/exams', label: 'Exams', icon: AssignmentRoundedIcon },
  { to: '/store', label: 'Store', icon: StorefrontRoundedIcon },
  { to: '/visualizer', label: 'Visualizer', icon: BarChartRoundedIcon },
];

// Phone menu = the dashboard sections (same list as the desktop dashboard sidebar).
// Problems is not listed here: it is one tap away in the bottom tab bar.
export const DASH_SECTIONS = [
  { to: '/dashboard?view=contest', label: 'Contest', icon: MilitaryTechRoundedIcon, view: 'contest' },
  { to: '/dashboard?view=quests', label: 'Quests', icon: EmojiEventsRoundedIcon, view: 'quests' },
  { to: '/dashboard?view=explore', label: 'Explore', icon: ExploreRoundedIcon, view: 'explore' },
  { to: '/dashboard?view=plans', label: 'Study Plan', icon: SchoolRoundedIcon, view: 'plans' },
  { to: '/dashboard?view=leaderboard', label: 'Leaderboard', icon: LeaderboardRoundedIcon, view: 'leaderboard' },
  { to: '/dashboard?view=friends', label: 'Friends', icon: PeopleAltRoundedIcon, view: 'friends' },
];

// Admin deliberately has no Navbar link. Admins reach /admin/login directly
// (see AdminLoginPage / ProtectedRoute redirectTo).

export const isActivePath = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);

export const initialsFromName = (name) =>
  (name || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
