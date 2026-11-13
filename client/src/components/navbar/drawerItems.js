import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { DASH_SECTIONS, isActivePath } from './navConfig';

// Dashboard sections come from DASH_SECTIONS (looked up by view).
const dashLink = (view) => ({ ...DASH_SECTIONS.find((section) => section.view === view), isDashboard: true });

// Phone menu, most used first. Related links share one entry with one icon (a group), so the menu shows six entries
// instead of ten: your progress, preparation (learning plan, company prep, explore), competition (contest, quests,
// leaderboard), friends, the store and the subscription plans. Problems, Aptitude and Community are in the tab bar.
export const DRAWER_ITEMS = [
  { to: '/you', label: 'My stats', icon: InsightsRoundedIcon, signedInOnly: true },
  { label: 'Prepare', icon: MenuBookRoundedIcon, children: [dashLink('plans'), { to: '/prep', label: 'Companies' }, dashLink('explore')] },
  { label: 'Compete', icon: EmojiEventsRoundedIcon, children: [dashLink('contest'), dashLink('quests'), dashLink('leaderboard')] },
  dashLink('friends'),
  { to: '/store', label: 'Store', icon: StorefrontRoundedIcon },
  { to: '/plans', label: 'Plans', icon: WorkspacePremiumRoundedIcon },
];

// Dashboard sections are active when the dashboard is open on that view (no view = the default section).
export const isDrawerLinkActive = (link, pathname, dashView) =>
  link.isDashboard ? pathname === '/dashboard' && (dashView || null) === link.view : isActivePath(pathname, link.to);

export const isGroupActive = (group, pathname, dashView) => group.children.some((link) => isDrawerLinkActive(link, pathname, dashView));

// The group that holds the current page opens first, so the person sees where they are.
export const findActiveGroupLabel = (pathname, dashView) =>
  DRAWER_ITEMS.find((item) => item.children && isGroupActive(item, pathname, dashView))?.label ?? null;
