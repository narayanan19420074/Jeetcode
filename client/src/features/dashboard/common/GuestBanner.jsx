import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { FONT_WEIGHTS } from '../../../app/design/designTokens';
import { surface } from '../dashboardUtils';

const GUEST_MESSAGE_WIDTH_UNITS = 70;

// Shown to people who are not signed in, on every screen size.
export default function GuestBanner() {
  const navigate = useNavigate();
  return (
    <Box sx={[surface, { p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }]}>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: (theme) => theme.spacing(GUEST_MESSAGE_WIDTH_UNITS) }}>
        You're browsing as a guest. Sign up to save streaks, track submissions, and unlock AI hints. It's free.
      </Typography>
      <Button variant="contained" disableElevation size="small" onClick={() => navigate('/login')} sx={{ fontWeight: FONT_WEIGHTS.bold }}>
        Sign up free
      </Button>
    </Box>
  );
}
