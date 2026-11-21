import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery, useTheme } from '@mui/material';
import useProblemLists from '../dashboard/useProblemLists';
import MobileYou from './MobileYou';
import { initialsFromName, socialUrl, timeAgo } from './common/youFormat';
import { socialLinksOf } from './common/youSocials';
import useYouStats from './common/useYouStats';
import YouDesktopView from './desktop/YouDesktopView';

const toMobileProps = ({ user, socials, stats, listsApi, tab, onTab }) => ({
  user,
  initials: initialsFromName(user.name),
  socials,
  socialUrl,
  timeAgo,
  totals: stats.totals,
  activity: stats.activity,
  subs: stats.subs,
  onLoadSubs: stats.loadSubs,
  listsApi,
  badges: stats.badges,
  earnedCount: stats.earnedCount,
  activeThisMonth: stats.activeThisMonth,
  tab,
  onTab,
});

// My stats. Phones get the full-screen MobileYou; wide screens show it in the dashboard main area (see DashboardViewContent).
export default function YouPage() {
  const user = useSelector((state) => state.auth.user);
  const isPhone = useMediaQuery(useTheme().breakpoints.down('md'));
  const listsApi = useProblemLists(user?.id);
  const stats = useYouStats(user);
  const [tab, setTab] = useState('lists');

  if (!user) return null;
  const view = { user, socials: socialLinksOf(user), stats, listsApi, tab, onTab: setTab };
  return isPhone ? <MobileYou {...toMobileProps(view)} /> : <YouDesktopView {...view} />;
}
