import { Box, Stack, Typography } from '@mui/material';
import AuthorLink from './AuthorLink';
import { PostAvatar, authorLabel } from './PostAuthor';
import FollowButton from './FollowButton';
import PostMenu from './PostMenu';
import { categoryLabel } from './communityCategories';
import { timeAgo } from '../../workspace/community/CommunityBits';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

// Top of a feed post: avatar, author, time and category, then Follow and the "..." menu on the right.
export default function PostCardHeader({ post, onRemoved }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <AuthorLink author={post.author} sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <PostAvatar author={post.author} size={SIZES.avatar.post} />
        <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
          <Typography noWrap sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold }}>{authorLabel(post.author)}</Typography>
          <Typography noWrap sx={{ color: 'var(--lib-muted)', letterSpacing: LIB_TRACKING, fontSize: FONT_SIZES.body }}>
            {timeAgo(post.createdAt)} · {categoryLabel(post.category)}
          </Typography>
        </Box>
      </AuthorLink>
      <FollowButton author={post.author} isOwn={post.isMine} isFollowing={post.isFollowingAuthor} />
      <PostMenu post={post} onRemoved={onRemoved} />
    </Stack>
  );
}
