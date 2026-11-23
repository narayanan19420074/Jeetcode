import { Box } from '@mui/material';
import StoreFilterCard from './StoreFilterCard';

// Right column of the Store page: the filters.
export default function StoreRail({ store }) {
  return (
    <Box sx={{ display: 'grid', gap: 1.5, alignContent: 'start', pr: { lg: 1.5 } }}>
      <StoreFilterCard store={store} />
    </Box>
  );
}
