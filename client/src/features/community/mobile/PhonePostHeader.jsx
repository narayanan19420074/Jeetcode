import { Box, IconButton, Stack, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { PostAvatar, authorLabel } from '../common/PostAuthor';
import FollowButton from '../common/FollowButton';
import PostMenu from '../common/PostMenu';
import useHidePost from '../common/useHidePost';
import { categoryLabel } from '../common/communityCategories';
import { CONNECTION_LEVEL_LABEL } from './phoneFeedPlaceholders';
import { timeAgo } from '../../workspace/community/CommunityBits';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

const mutedSx = { color: 'var(--lib-muted)', letterSpacing: LIB_TRACKING, fontSize: FONT_SIZES.body };

// Name with the verified mark and connection level. Anonymous posts show only the label.
function AuthorLine({ author }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Typography noWrap sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold }}>{authorLabel(author)}</Typography>
      {author && <VerifiedUserOutlinedIcon aria-label="Verified" sx={{ fontSize: SIZES.iconSize.small, color: 'text.secondary', flexShrink: 0 }} />}
      {author && <Typography noWrap sx={{ ...mutedSx, flexShrink: 0 }}>· {CONNECTION_LEVEL_LABEL}</Typography>}
    </Stack>
  );
}

// "Not interested": hides this post for the viewer, the same action as in the "..." menu.
function DismissButton({ post, onRemoved }) {
  const { hidePost } = useHidePost(post, onRemoved);
  return (
    <IconButton aria-label="Hide this post" onClick={hidePost}>
      <CloseRoundedIcon />
    </IconButton>
  );
}

// Phone post header: avatar, name line, category, then time with Follow; the "..." menu and dismiss button on the right.
export default function PhonePostHeader({ post, onRemoved }) {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
      <PostAvatar author={post.author} size={SIZES.avatar.post} />
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <AuthorLine author={post.author} />
        <Typography noWrap sx={mutedSx}>{categoryLabel(post.category)}</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography noWrap sx={mutedSx}>{timeAgo(post.createdAt)}</Typography>
          <FollowButton author={post.author} isOwn={post.isMine} isFollowing={post.isFollowingAuthor} compact />
        </Stack>
      </Box>
      <Stack direction="row" sx={{ mr: -1, mt: -0.5 }}>
        <PostMenu post={post} onRemoved={onRemoved} />
        <DismissButton post={post} onRemoved={onRemoved} />
      </Stack>
    </Stack>
  );
}
