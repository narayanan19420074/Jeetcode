import { Box } from '@mui/material';
import ProblemFilterCard from './ProblemFilterCard';
import SidebarLists from './SidebarLists';

// Right column of the Problems page: the filters, then the learner's lists.
export default function ProblemsRail({ lib, isAuthenticated, listsApi }) {
  return (
    <Box sx={{ display: 'grid', gap: 1.5, alignContent: 'start', pr: { lg: 1.5 }, gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))', lg: 'minmax(0,1fr)' } }}>
      <ProblemFilterCard lib={lib} isAuthenticated={isAuthenticated} />
      <SidebarLists listsApi={listsApi} />
    </Box>
  );
}
