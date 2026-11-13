import { Box } from '@mui/material';
import ChallengePanel from './ChallengePanel';
import ProgressPanel from './ProgressPanel';

// Right column of the Problems page: your progress and today's challenge. Saved lists live in the left sidebar.
export default function ProblemsRail({ progress, featured }) {
  return (
    <Box sx={{ display: 'grid', gap: 2, alignContent: 'start', pb: { lg: 1 }, gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))', lg: 'minmax(0,1fr)' } }}>
      <ProgressPanel progress={progress} />
      <ChallengePanel featured={featured} />
    </Box>
  );
}
