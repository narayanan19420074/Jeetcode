import { Box, Stack } from '@mui/material';
import Markdown from '../../workspace/community/Markdown';
import { communityImageUrl } from './imageUpload';
import { splitPostBody } from './postImages';
import { RADII_PX, SIZES } from '../../../app/design/designTokens';

const pictureSx = { display: 'block', width: SIZES.fill, borderRadius: RADII_PX.card };

// The text of a post with its uploaded images shown in place.
export default function PostBody({ source }) {
  return (
    <Stack spacing={2}>
      {splitPostBody(source).map((segment, index) =>
        segment.type === 'image' ? (
          <Box key={`image-${index}`} component="img" src={communityImageUrl(segment.id)} alt={segment.alt || 'Post image'} loading="lazy" sx={pictureSx} />
        ) : (
          <Markdown key={`text-${index}`} source={segment.text} />
        )
      )}
    </Stack>
  );
}
