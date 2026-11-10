import { Box, Stack, Typography } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EngagementButton from './EngagementButton';
import { CommentOutlineIcon, LikeFilledIcon, LikeOutlineIcon, RepostOutlineIcon, SendOutlineIcon } from './feedActionIcons';
import { useRepostPost } from './usePostEngagement';
import { useSharePost } from './sharePost';
import useVote from '../../workspace/community/communityBits/useVote';
import { FONT_SIZES, SIZES } from '../../../app/design/designTokens';

function ViewCount({ value }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} aria-label={`${value} views`} sx={{ color: 'var(--lib-muted)', pr: 1 }}>
      <VisibilityOutlinedIcon sx={{ fontSize: SIZES.iconSize.small }} />
      <Typography component="span" sx={{ fontSize: FONT_SIZES.body }}>{value}</Typography>
    </Stack>
  );
}

// The row under a feed post: like, comment, repost and share, then the view count. Liking is the same vote the post page uses.
export default function PostEngagementBar({ post }) {
  const vote = useVote({ targetType: 'post', targetId: post._id, score: post.score, myVote: post.myVote, isMine: post.isMine });
  const repost = useRepostPost(post);
  const share = useSharePost(post);
  return (
    <Box>
      <Stack direction="row" alignItems="center">
        <EngagementButton icon={vote.state.myVote === 1 ? LikeFilledIcon : LikeOutlineIcon} label="Like" count={vote.state.score} active={vote.state.myVote === 1} onClick={() => vote.cast(1)} />
        <EngagementButton icon={CommentOutlineIcon} label="Comments" count={post.commentCount} to={`/community/${post._id}`} />
        <EngagementButton icon={RepostOutlineIcon} label="Repost" count={repost.count} active={repost.on} onClick={repost.toggle} disabled={repost.busy} />
        <EngagementButton icon={SendOutlineIcon} label="Share" onClick={share} />
        <Box sx={{ flex: 1 }} />
        <ViewCount value={post.viewCount} />
      </Stack>
      {vote.error && <Typography role="alert" sx={{ fontSize: FONT_SIZES.caption, color: 'error.main' }}>{vote.error}</Typography>}
    </Box>
  );
}
