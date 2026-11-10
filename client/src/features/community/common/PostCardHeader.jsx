import { Box, Stack, Typography } from '@mui/material';
import { PostAvatar, authorLabel } from './PostAuthor';
import FollowButton from './FollowButton';
import PostMenu from './PostMenu';
import { POST_CATEGORY_OPTIONS } from './communityCategories';
import { timeAgo } from '../../workspace/community/CommunityBits';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

const categoryLabel = (value) => POST_CATEGORY_OPTIONS.find((option) => option.value === value)?.label;

// Top of a feed post: avatar, author, time and category, then Follow and the "..." menu on the right.
export default function PostCardHeader({ post, onRemoved }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <PostAvatar author={post.author} size={SIZES.avatar.post} />
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold }}>{authorLabel(post.author)}</Typography>
        <Typography noWrap sx={{ color: 'var(--lib-muted)', letterSpacing: LIB_TRACKING, fontSize: FONT_SIZES.body }}>
          {timeAgo(post.createdAt)} · {categoryLabel(post.category)}
        </Typography>
      </Box>
      <FollowButton author={post.author} isOwn={post.isMine} isFollowing={post.isFollowingAuthor} />
      <PostMenu post={post} onRemoved={onRemoved} />
    </Stack>
  );
}
