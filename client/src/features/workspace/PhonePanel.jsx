import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { wsSurface } from './workspaceTheme';

// Phone tab body (Solutions / Discussion / Submissions). Stays mounted while
// hidden so switching tabs keeps scroll position and open threads.
export default function PhonePanel({ show, children }) {
  const surf = wsSurface(useTheme());
  return (
    <Box sx={{ display: show ? 'block' : 'none', flex: 1, minHeight: 0, overflowY: 'auto', px: 2, pt: 1.5, pb: 3, bgcolor: surf.chrome }}>{children}</Box>
  );
}
