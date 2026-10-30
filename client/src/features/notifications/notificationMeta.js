import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';

// Each type has its own icon colour (all dark enough to read on the light cream cards).
// The bell has three tabs. Each notification `type` belongs to exactly one of them.
export const TABS = [
  { key: 'social', label: 'Social', icon: PeopleAltRoundedIcon, empty: 'No friend activity yet. Requests, invites and nudges show up here.' },
  { key: 'updates', label: 'Updates', icon: TrendingUpRoundedIcon, empty: 'Nothing new. Rank changes, rewards and offers show up here.' },
  { key: 'events', label: 'Events', icon: EventRoundedIcon, empty: 'No events right now. Contests and the daily challenge show up here.' },
];

export const META = {
  // social
  request: { cat: 'social', icon: PersonAddAlt1RoundedIcon, color: '#6366F1', cta: 'Review' },
  accepted: { cat: 'social', icon: HowToRegRoundedIcon, color: '#16A34A', cta: 'Open' },
  room: { cat: 'social', icon: LaptopMacRoundedIcon, color: '#0284C7', cta: 'Join' },
  nudge: { cat: 'social', icon: LocalFireDepartmentRoundedIcon, color: '#EA580C', cta: 'Solve' },
  plan: { cat: 'social', icon: GroupAddRoundedIcon, color: '#7C3AED', cta: 'Open plan' },
  // updates
  leaderboard: { cat: 'updates', icon: LeaderboardRoundedIcon, color: '#D97706', cta: 'See rank' },
  quest: { cat: 'updates', icon: CardGiftcardRoundedIcon, color: '#DB2777', cta: 'Claim' },
  offer: { cat: 'updates', icon: WorkspacePremiumRoundedIcon, color: '#0D9488', cta: 'See plans' },
  // events
  contest: { cat: 'events', icon: EmojiEventsRoundedIcon, color: '#CA8A04', cta: 'View' },
  daily: { cat: 'events', icon: BoltRoundedIcon, color: '#EF6C4D', cta: 'Solve now' },
};

export const metaOf = (n) => META[n.type] || META.request;
export const categoryOf = (n) => metaOf(n).cat;
