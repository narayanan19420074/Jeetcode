import { Box, Stack, Typography } from '@mui/material';
import AuthorLink from '../common/AuthorLink';
import { PostAvatar } from '../common/PostAuthor';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';
import PhoneHeaderActions from './PhoneHeaderActions';

const rowSx = { alignItems: 'center', mt: -1, mb: 1, borderBottom: '1px solid', borderColor: 'divider' };
const linkSx = { display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: SIZES.flexShrinkMinWidth };

// "Priya G likes this": the viewer's friend who liked the post, above the author row. It takes over the "..."
// menu and the dismiss button, which sit in the author row when no friend liked the post.
export default function FriendLikeRow({ post, onRemoved }) {
  const friend = post.likedByFriend;
  return (
    <Stack direction="row" sx={rowSx}>
      <AuthorLink author={friend} sx={linkSx}>
        <PostAvatar author={friend} size={SIZES.avatar.xs} />
        <Typography noWrap sx={{ fontSize: FONT_SIZES.caption, color: 'var(--lib-muted)' }}>
          <Box component="span" sx={{ fontWeight: FONT_WEIGHTS.semibold, color: 'text.primary' }}>{friend.name}</Box> likes this
        </Typography>
      </AuthorLink>
      <PhoneHeaderActions post={post} onRemoved={onRemoved} />
    </Stack>
  );
}
