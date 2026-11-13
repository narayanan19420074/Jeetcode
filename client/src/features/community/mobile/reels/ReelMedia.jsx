import { Box, Typography } from '@mui/material';
import { communityImageUrl } from '../../common/imageUpload';
import { clamp } from '../../../workspace/community/CommunityBits';
import { BANNER_GRADIENT } from '../../../dashboard/bannerGradients';
import { FONT_WEIGHTS, SIZES } from '../../../../app/design/designTokens';

const TEXT_LINES = 10;
const fillSx = { position: 'absolute', inset: 0 };

// A post with a photo shows the whole photo on black. A post without one shows its text large on a colour, so every post
// fills the screen.
export default function ReelMedia({ post }) {
  if (post.coverImage) {
    return <Box component="img" src={communityImageUrl(post.coverImage)} alt="" sx={{ ...fillSx, display: 'block', width: SIZES.fill, height: SIZES.fill, objectFit: 'contain' }} />;
  }
  return (
    <Box sx={{ ...fillSx, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2, px: 3, background: BANNER_GRADIENT.visualizer }}>
      <Typography variant="h5" sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'common.white', wordBreak: 'break-word' }}>{post.title}</Typography>
      <Typography sx={{ color: 'common.white', ...clamp(TEXT_LINES) }}>{post.excerpt}</Typography>
    </Box>
  );
}
