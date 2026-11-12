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
const authorLinkSx = { display: 'flex', alignItems: 'flex-start', gap: 1, flex: 1, minWidth: SIZES.flexShrinkMinWidth };

// Name and connection level on one line, the author's headline under it, then how long ago it was posted.
// Anonymous posts show only the label and the time.
function AuthorText({ post }) {
  const { author, authorHeadline } = post;
  return (
    <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', gap: 0.5 }}>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.semibold, lineHeight: 1.25 }}>{authorLabel(author)}</Typography>
        {author && <Typography noWrap sx={{ ...mutedSx, flexShrink: 0 }}>· {CONNECTION_LEVEL_LABEL}</Typography>}
      </Stack>
      {authorHeadline && <Typography sx={{ ...mutedSx, ...clamp(HEADLINE_LINES) }}>{authorHeadline}</Typography>}
      <Typography noWrap sx={mutedSx}>{timeAgo(post.createdAt)} · {categoryLabel(post.category)}</Typography>
    </Box>
  );
}

// Follow on the right of the author row. With no friend row above, the "..." menu and dismiss button sit over it.
function AuthorRowActions({ post, onRemoved, showMenu }) {
  return (
    <Stack sx={{ alignItems: 'flex-end', flexShrink: 0, mr: -1 }}>
      {showMenu && <PhoneHeaderActions post={post} onRemoved={onRemoved} />}
      <FollowButton author={post.author} isOwn={post.isMine} isFollowing={post.isFollowingAuthor} fontSize={FONT_SIZES.title} />
    </Stack>
  );
}

// Phone post header, laid out like the LinkedIn app: an optional "friend likes this" row, then photo, name,
// headline and time (all opening the author's Job profile) with Follow on the right.
export default function PhonePostHeader({ post, onRemoved }) {
  const hasFriendLike = Boolean(post.likedByFriend);
  return (
    <Box>
      {hasFriendLike && <FriendLikeRow post={post} onRemoved={onRemoved} />}
      <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1 }}>
        <AuthorLink author={post.author} sx={authorLinkSx}>
          <PostAvatar author={post.author} size={SIZES.avatar.post} />
          <AuthorText post={post} />
        </AuthorLink>
        <AuthorRowActions post={post} onRemoved={onRemoved} showMenu={!hasFriendLike} />
      </Stack>
    </Box>
  );
}
