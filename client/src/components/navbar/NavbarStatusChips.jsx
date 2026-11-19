import { Box } from '@mui/material';
import ProBadge from '../ProBadge';
import useHasProAccess from '../useHasProAccess';

// Only the Pro badge sits in the bar. Coins live on the Store page and streaks on My stats, so the bar stays calm.
// The badge shows from the sm breakpoint up; on phones it is in the phone menu.
export default function NavbarStatusChips({ user }) {
  const hasProAccess = useHasProAccess(user);
  if (!hasProAccess) return null;
  return (
    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
      <ProBadge />
    </Box>
  );
}
