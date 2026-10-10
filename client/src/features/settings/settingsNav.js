import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import AccessibilityNewRoundedIcon from '@mui/icons-material/AccessibilityNewRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';

// Sidebar structure, modelled on GitHub's settings: grouped, one page per item.
// `keywords` feed the "Find a setting" search box.
export const SETTINGS_GROUPS = [
  {
    label: 'Access',
    items: [
      { key: 'profile', label: 'Public profile', icon: PersonRoundedIcon, keywords: 'name bio avatar photo picture location college company website social github linkedin x leetcode' },
      { key: 'account', label: 'Account', icon: ManageAccountsRoundedIcon, keywords: 'username handle email sign-in google github linkedin export download data delete danger' },
      { key: 'billing', label: 'Billing & plans', icon: WorkspacePremiumRoundedIcon, keywords: 'pro license key subscription plan cancel upgrade payment' },
    ],
  },
  {
    label: 'Preferences',
    items: [
      { key: 'appearance', label: 'Appearance', icon: PaletteRoundedIcon, keywords: 'theme dark light system accent color density compact text size font contrast' },
      { key: 'accessibility', label: 'Accessibility', icon: AccessibilityNewRoundedIcon, keywords: 'reduce motion animation underline links' },
      { key: 'editor', label: 'Code editor', icon: CodeRoundedIcon, keywords: 'font size tab wrap minimap line numbers ligatures language monaco' },
      { key: 'notifications', label: 'Notifications', icon: NotificationsRoundedIcon, keywords: 'email streak reminder digest achievements updates' },
    ],
  },
  {
    label: 'Security',
    items: [
      { key: 'password', label: 'Password', icon: KeyRoundedIcon, keywords: 'password change reset authentication' },
      { key: 'sessions', label: 'Sessions', icon: DevicesRoundedIcon, keywords: 'devices sign out logout browsers active' },
      { key: 'security-log', label: 'Security log', icon: HistoryRoundedIcon, keywords: 'audit history activity events login' },
    ],
  },
];

export const SETTINGS_ITEMS = SETTINGS_GROUPS.flatMap((g) => g.items);
export const DEFAULT_SECTION = 'profile';
