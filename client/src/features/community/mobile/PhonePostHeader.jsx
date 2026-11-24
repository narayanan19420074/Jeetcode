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

const HEADLINE_LINES = 1;
const mutedSx = { color: 'var(--lib-muted)', letterSpacing: LIB_TRACKING, fontSize: FONT_SIZES.body, lineHeight: 1.35 };
const nameLinkSx = { display: 'flex', alignItems: 'baseline', gap: 0.5, minWidth: SIZES.flexShrinkMinWidth };
// The follow button is vertically centred on the name line and its right edge lines up with the "..." menu, so the
// header reads as two clean columns: who wrote it on the left, what you can do on the right.
const followSx = { my: -0.5, py: 0, px: 0.5 };
const actionsSx = { display: 'flex', alignItems: 'center', flexShrink: 0, mr: -0.5, mt: -0.25 };

// Name and connection level (opens the author's Job profile). Anonymous posts show only the label.
function NameRow({ author }) {
  return (
    <AuthorLink author={author} sx={nameLinkSx}>
      <Typography noWrap sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.3 }}>{authorLabel(author)}</Typography>
      {author && <Typography noWrap sx={{ ...mutedSx, flexShrink: 0 }}>· {CONNECTION_LEVEL_LABEL}</Typography>}
    </AuthorLink>
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

// Phone post header, laid out like the LinkedIn app: an optional "friend likes this" row, then photo, name, headline and
// time on the left, Follow and the "..." menu on the right. With a friend row above, the menu moves up into that row.
export default function PhonePostHeader({ post, onRemoved }) {
  const hasFriendLike = Boolean(post.likedByFriend);
  return (
    <Box>
      {hasFriendLike && <FriendLikeRow post={post} onRemoved={onRemoved} />}
      <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1.25 }}>
        <AuthorLink author={post.author} sx={{ display: 'flex', flexShrink: 0 }}>
          <PostAvatar author={post.author} size={SIZES.avatar.post} />
        </AuthorLink>
        <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
          <NameRow author={post.author} />
          <AuthorDetails post={post} />
        </Box>
        <Box sx={actionsSx}>
          <FollowButton author={post.author} isOwn={post.isMine} isFollowing={post.isFollowingAuthor} fontSize={FONT_SIZES.title} sx={followSx} />
          {!hasFriendLike && <PhoneHeaderActions post={post} onRemoved={onRemoved} />}
        </Box>
      </Stack>
    </Box>
  );
}
