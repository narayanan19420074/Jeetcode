import { Box, Chip, Stack, Typography } from '@mui/material';
import { PostAvatar, authorLabel } from './PostAuthor';
import { POST_CATEGORY_OPTIONS } from './communityCategories';
import { timeAgo } from '../../workspace/community/CommunityBits';
import { LIB_TRACKING, libChipSx } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

const mutedSx = { color: 'var(--lib-muted)', letterSpacing: LIB_TRACKING };

// What the reader sees before the post text: when it was written, the title, who wrote it and its category.
export default function PostMeta({ post }) {
  const category = POST_CATEGORY_OPTIONS.find((option) => option.value === post.category);
  return (
    <Stack spacing={1.5}>
      <Typography sx={{ ...mutedSx, fontSize: FONT_SIZES.bodyLg }}>{timeAgo(post.createdAt)}</Typography>
      <Typography component="h1" sx={{ fontSize: FONT_SIZES.displayLg, lineHeight: 1.25, fontWeight: FONT_WEIGHTS.bold }}>{post.title}</Typography>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <PostAvatar author={post.author} size={SIZES.avatar.md} />
        <Typography noWrap sx={{ ...mutedSx, fontSize: FONT_SIZES.subheading }}>{authorLabel(post.author)}</Typography>
      </Stack>
      {category && (
        <Box>
          <Chip label={category.label} sx={libChipSx(false)} />
        </Box>
      )}
    </Stack>
  );
}
