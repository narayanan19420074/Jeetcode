import { Box } from '@mui/material';
import { LibraryFont } from '../../dashboard/components/libraryStyle';

// Page padding shared by every phone Study Plan screen.
export function MobileShell({ children }) {
  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>{children}</Box>
    </LibraryFont>
  );
}
