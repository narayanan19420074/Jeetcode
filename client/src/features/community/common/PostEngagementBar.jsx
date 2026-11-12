import { Box, Stack, Typography } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EngagementButton from './EngagementButton';
import { CommentOutlineIcon, LikeFilledIcon, LikeOutlineIcon, RepostOutlineIcon, SendOutlineIcon } from './feedActionIcons';
import { useRepostPost } from './usePostEngagement';
import useCommentsSheet from './useCommentsSheet';
import CommentsSheet from '../comments/CommentsSheet';
import { useSharePost } from './sharePost';
import useVote from '../../workspace/community/communityBits/useVote';
import { FONT_SIZES, SIZES } from '../../../app/design/designTokens';

function ViewCount({ value }) {
  return (
    <Stack direction="row" spacing={0.5} aria-label={`${value} views`} sx={{ alignItems: 'center', color: 'var(--lib-muted)', pr: 1 }}>
      <VisibilityOutlinedIcon sx={{ fontSize: SIZES.iconSize.small }} />
      <Typography component="span" sx={{ fontSize: FONT_SIZES.body }}>{value}</Typography>
    </Stack>
  );
}

// The row under a feed post: like, comment, repost and share, then the view count (or `trailing`, which the phone feed
// uses for its reactions). Liking is the same vote the post page uses.
export default function PostEngagementBar({ post, trailing }) {
  const vote = useVote({ targetType: 'post', targetId: post._id, score: post.score, myVote: post.myVote });
  const repost = useRepostPost(post);
  const share = useSharePost(post);
  const comments = useCommentsSheet(post);
  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        <EngagementButton icon={vote.state.myVote === 1 ? LikeFilledIcon : LikeOutlineIcon} label="Like" count={vote.state.score} active={vote.state.myVote === 1} onClick={() => vote.cast(1)} />
        <EngagementButton icon={CommentOutlineIcon} label="Comments" count={comments.count} onClick={comments.show} />
        <EngagementButton icon={RepostOutlineIcon} label="Repost" count={repost.count} active={repost.on} onClick={repost.toggle} disabled={repost.busy} />
        <EngagementButton icon={SendOutlineIcon} label="Share" onClick={share} />
        <Box sx={{ flex: 1 }} />
        {trailing ?? <ViewCount value={post.viewCount} />}
      </Stack>
      <CommentsSheet post={post} open={comments.open} onClose={comments.hide} onCountChange={comments.changeCount} />
      {vote.error && <Typography role="alert" sx={{ fontSize: FONT_SIZES.caption, color: 'error.main' }}>{vote.error}</Typography>}
    </Box>
  );
}
