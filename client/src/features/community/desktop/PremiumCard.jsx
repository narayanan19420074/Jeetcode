import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { FONT_WEIGHTS } from '../../../app/design/designTokens';
import RailCard from './RailCard';

// "Unlock premium tools" card under the profile. Hidden for Pro members and guests.
export default function PremiumCard() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated || user?.isPro) return null;

  return (
    <RailCard sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Unlock Pro tools & insights
      </Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
        <WorkspacePremiumRoundedIcon color="warning" fontSize="small" />
        <Link component={RouterLink} to="/plans" underline="hover" color="text.primary" variant="body2" sx={{ fontWeight: FONT_WEIGHTS.semibold }}>
          Go Pro
        </Link>
      </Stack>
    </RailCard>
  );
}
