import { Box } from '@mui/material';
import SolvedCard from '../../../components/SolvedCard';
import { MONTHLY_BADGE_GOAL } from '../../dashboard/dashboardUtils';
import { SIZES } from '../../../app/design/designTokens';
import YouAchievements from './YouAchievements';
import { StatTile } from './YouParts';
import { YouIdentity, YouLinks, YouSettingsLink } from './YouIdentity';
import { YouListsTab, YouSubmissionsTab, YouTabs } from './YouTabContent';

function YouStatTiles({ subs, activeToday, activeThisMonth }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1.5 }}>
      <StatTile label="Submissions" value={subs.total ?? '–'} sub={activeToday ? 'Active today' : 'None yet today'} />
      <StatTile label="This month" value={`${activeThisMonth} days`} sub={`Goal ${MONTHLY_BADGE_GOAL} days`} />
    </Box>
  );
}

// Wide-screen My stats: opens in the dashboard main area, so it has no back button of its own.
export default function YouDesktopView({ user, socials, stats, listsApi, tab, onTab }) {
  return (
    <Box sx={{ maxWidth: SIZES.readingMaxWidth, mx: 'auto', pb: 4 }}>
      <YouSettingsLink />
      <YouIdentity user={user} />
      <YouLinks user={user} socials={socials} />
      <SolvedCard user={user} isAuthenticated totals={stats.totals} activity={stats.activity} />
      <YouStatTiles subs={stats.subs} activeToday={stats.activeToday} activeThisMonth={stats.activeThisMonth} />
      <YouAchievements badges={stats.badges} earnedCount={stats.earnedCount} />
      <YouTabs tab={tab} onTab={onTab} />
      {tab === 'lists' ? <YouListsTab lists={listsApi.lists} /> : <YouSubmissionsTab subs={stats.subs} onLoad={stats.loadSubs} />}
    </Box>
  );
}
