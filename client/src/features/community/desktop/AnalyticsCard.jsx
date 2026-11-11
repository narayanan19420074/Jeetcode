import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';
import { FONT_WEIGHTS } from '../../../app/design/designTokens';
import RailCard from './RailCard';

// LinkedIn shows "Profile viewers" here; JeetCode has no viewer count, so it shows your solved problems and
// opens the stats page.
export default function AnalyticsCard() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) return null;

  return (
    <RailCard sx={{ p: 2 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.semibold }}>
          Problems solved
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}>
          {user.totalSolved ?? 0}
        </Typography>
      </Stack>
      <Link component={RouterLink} to="/you" underline="hover" color="text.primary" variant="body2" sx={{ display: 'block', mt: 1.5, fontWeight: FONT_WEIGHTS.semibold }}>
        View all analytics
      </Link>
    </RailCard>
  );
}
