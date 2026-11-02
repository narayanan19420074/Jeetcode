import { Box } from '@mui/material';
import ChallengePanel from './ChallengePanel';
import ListsPanel from './ListsPanel';
import ProgressPanel from './ProgressPanel';

// Summary panels next to the library. On medium screens they sit in one row above it, on large screens in a column beside it.
export default function SideRail({ progress, featured, savedCount }) {
  return (
    <Box
      className="autohide-scroll"
      sx={{
        display: 'grid',
        gap: 2,
        alignContent: 'start',
        minHeight: 0,
        gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(3, minmax(0,1fr))', lg: 'minmax(0,1fr)' },
        overflowY: { lg: 'auto' },
      }}
    >
      <ProgressPanel progress={progress} />
      <ChallengePanel featured={featured} />
      <ListsPanel savedCount={savedCount} />
    </Box>
  );
}
