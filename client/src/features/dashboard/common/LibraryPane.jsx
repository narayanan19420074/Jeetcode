import { Box, Stack } from '@mui/material';
import { Z_INDEX } from '../../../app/design/designTokens';

// The library stays mounted while other views are open, so its filters, page and search survive a trip to Quests or Explore.
export default function LibraryPane({ active, children }) {
  return (
    <Box sx={{ display: active ? 'block' : 'none' }}>
      <Stack spacing={2.5} sx={{ position: 'relative', zIndex: Z_INDEX.base }}>
        {children}
      </Stack>
    </Box>
  );
}
