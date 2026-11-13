import { Box, Stack, Typography } from '@mui/material';
import AuthorLink from '../common/AuthorLink';
import { PostAvatar, authorLabel } from '../common/PostAuthor';
import FollowButton from '../common/FollowButton';
import { categoryLabel } from '../common/communityCategories';
import { CONNECTION_LEVEL_LABEL } from './phoneFeedPlaceholders';
import FriendLikeRow from './FriendLikeRow';
import PhoneHeaderActions from './PhoneHeaderActions';
import { clamp, timeAgo } from '../../workspace/community/CommunityBits';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

const HEADLINE_LINES = 2;
const mutedSx = { color: 'var(--lib-muted)', letterSpacing: LIB_TRACKING, fontSize: FONT_SIZES.caption };
const nameLinkSx = { display: 'flex', alignItems: 'baseline', gap: 0.5, minWidth: SIZES.flexShrinkMinWidth };
// Follow sits right after the name, so it is small and does not make the name line taller than the text.
const followSx = { my: -0.5, py: 0 };

// Name and connection level (opens the author's Job profile), with Follow right after them. Anonymous posts show only
// the label.
function NameRow({ post }) {
  const { author } = post;
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
      <AuthorLink author={author} sx={nameLinkSx}>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.semibold, lineHeight: 1.25 }}>{authorLabel(author)}</Typography>
        {author && <Typography noWrap sx={{ ...mutedSx, flexShrink: 0 }}>· {CONNECTION_LEVEL_LABEL}</Typography>}
      </AuthorLink>
      <FollowButton author={author} isOwn={post.isMine} isFollowing={post.isFollowingAuthor} fontSize={FONT_SIZES.caption} sx={followSx} />
    </Stack>
  );
}

// The author's headline, then how long ago it was posted and in which category.
function AuthorDetails({ post }) {
  return (
    <AuthorLink author={post.author} sx={{ display: 'block' }}>
      {post.authorHeadline && <Typography sx={{ ...mutedSx, ...clamp(HEADLINE_LINES) }}>{post.authorHeadline}</Typography>}
      <Typography noWrap sx={mutedSx}>{timeAgo(post.createdAt)} · {categoryLabel(post.category)}</Typography>
    </AuthorLink>
  );
}

// Phone post header, laid out like the LinkedIn app: an optional "friend likes this" row, then photo, name with Follow,
// headline and time. The "..." menu and the dismiss button sit at the top right; with a friend row above, they move up
// into that row.
export default function PhonePostHeader({ post, onRemoved }) {
  const hasFriendLike = Boolean(post.likedByFriend);
  return (
    <Box>
      {hasFriendLike && <FriendLikeRow post={post} onRemoved={onRemoved} />}
      <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1 }}>
        <AuthorLink author={post.author} sx={{ display: 'flex', flexShrink: 0 }}>
          <PostAvatar author={post.author} size={SIZES.avatar.post} />
        </AuthorLink>
        <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
          <NameRow post={post} />
          <AuthorDetails post={post} />
        </Box>
        {!hasFriendLike && (
          <Box sx={{ mt: -0.75, mr: -1, flexShrink: 0 }}>
            <PhoneHeaderActions post={post} onRemoved={onRemoved} />
          </Box>
        )}
      </Stack>
    </Box>
  );
}
