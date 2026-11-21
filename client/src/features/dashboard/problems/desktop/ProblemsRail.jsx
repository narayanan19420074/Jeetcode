import { Box } from '@mui/material';
import ProblemFilterCard from './ProblemFilterCard';

// Right column of the Problems page: the filters.
export default function ProblemsRail({ lib, isAuthenticated }) {
  return (
    <Box sx={{ display: 'grid', gap: 1.5, alignContent: 'start', pr: { lg: 1.5 } }}>
      <ProblemFilterCard lib={lib} isAuthenticated={isAuthenticated} />
    </Box>
  );
}
