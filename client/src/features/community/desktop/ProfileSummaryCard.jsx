import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { Avatar, Box, Button, Link, Stack, Typography } from '@mui/material';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { PostAvatar } from '../common/PostAuthor';
import { BANNER_GRADIENT } from '../../dashboard/bannerGradients';
import { FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import RailCard from './RailCard';

const BIO_LINES = 2;
const clampSx = { display: '-webkit-box', WebkitLineClamp: BIO_LINES, WebkitBoxOrient: 'vertical', overflow: 'hidden' };

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

function CompanyRow({ company }) {
  if (!company) return null;
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1.5 }}>
      <Avatar variant="rounded" sx={{ width: SIZES.avatar.xs, height: SIZES.avatar.xs, borderRadius: RADII_PX.badge, bgcolor: 'action.hover', color: 'text.secondary' }}>
        <BusinessRoundedIcon fontSize="inherit" />
      </Avatar>
      <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.semibold }}>
        {company}
      </Typography>
    </Stack>
  );
}

// Left rail top card, like the LinkedIn feed: banner, round photo, name, about line, place and company.
export default function ProfileSummaryCard() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <GuestCard />;

  return (
    <RailCard>
      <Box sx={{ height: SIZES.communityBannerHeight, background: BANNER_GRADIENT.visualizer }} />
      <Box sx={{ px: 2, pb: 2, mt: -4 }}>
        <Box sx={{ display: 'inline-flex', border: '2px solid', borderColor: 'background.paper', borderRadius: RADII_PX.pill }}>
          <PostAvatar author={user} size={SIZES.avatar.lg} />
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 1 }}>
          <Link component={RouterLink} to="/you" underline="hover" color="text.primary" sx={{ fontWeight: FONT_WEIGHTS.bold, wordBreak: 'break-word' }}>
            {user.name}
          </Link>
          <VerifiedUserOutlinedIcon aria-label="Verified" fontSize="small" color="action" />
        </Stack>
        {user.bio && <Typography variant="body2" sx={clampSx}>{user.bio}</Typography>}
        {user.location && <Typography variant="body2" color="text.secondary">{user.location}</Typography>}
        <CompanyRow company={user.company} />
      </Box>
    </RailCard>
  );
}
