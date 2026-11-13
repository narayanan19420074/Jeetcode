import { Box } from '@mui/material';
import { SIZES } from '../../../../app/design/designTokens';
import ReelActions from './ReelActions';
import ReelCaption from './ReelCaption';
import ReelMedia from './ReelMedia';

// One full-screen post. Scroll snapping stops every swipe on exactly one post, and `stop: always` keeps a fast swipe from
// skipping over posts.
const slideSx = { position: 'relative', height: SIZES.fill, flexShrink: 0, overflow: 'hidden', bgcolor: 'common.black', scrollSnapAlign: 'start', scrollSnapStop: 'always' };

export default function ReelSlide({ post }) {
  return (
    <Box component="article" sx={slideSx}>
      <ReelMedia post={post} />
      <ReelCaption post={post} />
      <ReelActions post={post} />
    </Box>
  );
}
