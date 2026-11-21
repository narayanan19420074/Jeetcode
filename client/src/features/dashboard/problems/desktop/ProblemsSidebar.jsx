import { Box } from '@mui/material';
import BackToDashboard from '../../../../components/BackToDashboard';
import ProgressSummaryCard from './ProgressSummaryCard';

// Left column of the Problems page: the way back and your progress card. The filters (topics included) are in the right column.
export default function ProblemsSidebar({ lib, progress, listsApi }) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box><BackToDashboard /></Box>
      <ProgressSummaryCard lib={lib} progress={progress} listsApi={listsApi} />
    </Box>
  );
}
