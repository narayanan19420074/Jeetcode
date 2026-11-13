import { Box } from '@mui/material';
import RightRail from '../../components/RightRail';
import ChallengePanel from './ChallengePanel';
import ListsPanel from './ListsPanel';
import ProgressPanel from './ProgressPanel';

// Right column of the Problems page: the same streak calendar as the dashboard, then your progress, today's challenge and saved lists.
export default function ProblemsRail({ user, isAuthenticated, activity, progress, featured, savedCount }) {
  return (
    <Box sx={{ display: 'grid', gap: 2, alignContent: 'start', pb: { lg: 1 } }}>
      <RightRail user={user} isAuthenticated={isAuthenticated} activity={activity} />
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(3, minmax(0,1fr))', lg: 'minmax(0,1fr)' } }}>
        <ProgressPanel progress={progress} />
        <ChallengePanel featured={featured} />
        <ListsPanel savedCount={savedCount} />
      </Box>
    </Box>
  );
}
