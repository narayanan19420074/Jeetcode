import { Box } from '@mui/material';
import ChallengePanel from './ChallengePanel';
import ProblemFilterCard from './ProblemFilterCard';
import ProgressPanel from './ProgressPanel';
import SidebarLists from './SidebarLists';

// Right column of the Problems page: the filters first, then your progress, today's challenge and your lists.
export default function ProblemsRail({ lib, isAuthenticated, progress, featured, listsApi }) {
  return (
    <Box sx={{ display: 'grid', gap: 1.5, alignContent: 'start', pr: { lg: 1.5 }, gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))', lg: 'minmax(0,1fr)' } }}>
      <ProblemFilterCard lib={lib} isAuthenticated={isAuthenticated} />
      <ProgressPanel progress={progress} />
      <ChallengePanel featured={featured} />
      <SidebarLists listsApi={listsApi} />
    </Box>
  );
}
