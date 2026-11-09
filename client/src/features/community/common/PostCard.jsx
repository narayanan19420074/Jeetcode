import { Link as RouterLink } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import { PostAvatar, authorLabel } from './PostAuthor';
import PostStats from './PostStats';
import { clamp, timeAgo } from '../../workspace/community/CommunityBits';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

// One row of the feed: avatar, "author · time", title, two-line excerpt and counters. The whole row opens the post.
export default function PostCard({ post }) {
  return (
    <Box
      component={RouterLink}
      to={`/community/${post._id}`}
      sx={{ display: 'flex', gap: 1.5, py: 2, textDecoration: 'none', color: 'inherit', borderBottom: 1, borderColor: 'var(--lib-divider)' }}
    >
      <PostAvatar author={post.author} />
      <Stack spacing={0.5} sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.body, color: 'var(--lib-muted)' }}>
          {authorLabel(post.author)} · {timeAgo(post.createdAt)}
        </Typography>
        <Typography sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold, ...clamp(1) }}>{post.title}</Typography>
        <Typography sx={{ fontSize: FONT_SIZES.bodyLg, color: 'var(--lib-muted)', ...clamp(3) }}>
          {post.excerpt}
        </Typography>
        <Box sx={{ pt: 0.75 }}>
          <PostStats score={post.score} viewCount={post.viewCount} commentCount={post.commentCount} />
        </Box>
      </Stack>
    </Box>
  );
}
