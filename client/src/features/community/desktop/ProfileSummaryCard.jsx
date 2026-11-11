import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, Stack, Typography } from '@mui/material';
import { PostAvatar } from '../common/PostAuthor';
import { BANNER_GRADIENT } from '../../dashboard/bannerGradients';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import RailCard from './RailCard';

const BIO_LINES = 2;

function StatRow({ label, value }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
    </Stack>
  );
}

function GuestCard() {
  return (
    <RailCard sx={{ p: 2 }}>
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold }}>Join the conversation</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        Sign in to post, follow people and save posts.
      </Typography>
      <Button component={RouterLink} to="/login" variant="contained" disableElevation fullWidth>
        Sign in
      </Button>
    </RailCard>
  );
}

// Left rail top card, like the LinkedIn feed: banner, round photo, name, one line about you and two numbers.
export default function ProfileSummaryCard() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <GuestCard />;

  return (
    <RailCard>
      <Box sx={{ height: SIZES.communityBannerHeight, background: BANNER_GRADIENT.visualizer }} />
      <Stack sx={{ alignItems: 'center', px: 2, pb: 2, mt: -3.5 }}>
        <Box sx={{ border: '2px solid', borderColor: 'background.paper', borderRadius: RADII_PX.pill, display: 'flex' }}>
          <PostAvatar author={user} size={SIZES.avatar.lg} />
        </Box>
        <Link component={RouterLink} to="/you" underline="hover" color="text.primary" sx={{ mt: 1, fontWeight: FONT_WEIGHTS.bold, textAlign: 'center', wordBreak: 'break-word' }}>
          {user.name}
        </Link>
        {user.bio && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontSize: FONT_SIZES.caption, display: '-webkit-box', WebkitLineClamp: BIO_LINES, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {user.bio}
          </Typography>
        )}
      </Stack>
      <Stack spacing={0.5} sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <StatRow label="Problems solved" value={user.totalSolved ?? 0} />
        <StatRow label="Day streak" value={user.streakDays ?? 0} />
      </Stack>
    </RailCard>
  );
}
