import { Box, Typography } from '@mui/material';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../app/design/designTokens';

// Community home. Placeholder until the feed is built; the bottom-bar tab and the route are already wired.
export default function CommunityPage() {
  return (
    <Box sx={{ minHeight: SIZES.viewportHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, px: 3, textAlign: 'center' }}>
      <ForumRoundedIcon sx={{ fontSize: FONT_SIZES.display, color: 'primary.main' }} />
      <Typography sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold }}>Community</Typography>
      <Typography sx={{ fontSize: FONT_SIZES.body, color: 'text.secondary' }}>Discussions and shared solutions will appear here soon.</Typography>
    </Box>
  );
}
