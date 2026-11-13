import { Link as RouterLink } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';
import AuthorLink from '../../common/AuthorLink';
import FollowButton from '../../common/FollowButton';
import { PostAvatar, authorLabel } from '../../common/PostAuthor';
import { clamp } from '../../../workspace/community/CommunityBits';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../../app/design/designTokens';
import { blackFade } from './reelStyle';

const TITLE_LINES = 2;
const TEXT_LINES = 3;

// Bottom of the screen. The right padding leaves room for the action buttons.
const captionSx = (theme) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  pt: 8,
  pl: 2,
  pr: 9,
  pb: `calc(${theme.spacing(3)} + env(safe-area-inset-bottom))`,
  color: 'common.white',
  background: blackFade(theme, 'to top'),
});

function AuthorRow({ post }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      <AuthorLink author={post.author} sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <PostAvatar author={post.author} size={SIZES.avatar.sm} />
        <Typography noWrap sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.semibold }}>{authorLabel(post.author)}</Typography>
      </AuthorLink>
      <FollowButton author={post.author} isOwn={post.isMine} isFollowing={post.isFollowingAuthor} fontSize={FONT_SIZES.caption} />
    </Stack>
  );
}

function PostText({ post }) {
  return (
    <>
      <Typography sx={{ fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.semibold, ...clamp(TITLE_LINES) }}>{post.title}</Typography>
      <Typography sx={{ fontSize: FONT_SIZES.body, ...clamp(TEXT_LINES) }}>{post.excerpt}</Typography>
      <Link component={RouterLink} to={`/community/${post._id}`} underline="always" color="inherit" sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.semibold }}>
        Read post
      </Link>
    </>
  );
}

// Who posted it (with Follow) and the start of the text. A post without a photo already shows its text on the screen,
// so its caption is only the author.
export default function ReelCaption({ post }) {
  return (
    <Stack spacing={1} sx={captionSx}>
      <AuthorRow post={post} />
      {post.coverImage && <PostText post={post} />}
    </Stack>
  );
}
