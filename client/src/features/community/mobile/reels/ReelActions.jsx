import { IconButton, Stack, Typography } from '@mui/material';
import CommentsSheet from '../../comments/CommentsSheet';
import { CommentOutlineIcon, LikeFilledIcon, LikeOutlineIcon, SendOutlineIcon } from '../../common/feedActionIcons';
import { useSharePost } from '../../common/sharePost';
import useCommentsSheet from '../../common/useCommentsSheet';
import useVote from '../../../workspace/community/communityBits/useVote';
import { buttonBackdrop } from './reelStyle';

const railSx = (theme) => ({
  position: 'absolute',
  right: theme.spacing(1),
  bottom: `calc(${theme.spacing(3)} + env(safe-area-inset-bottom))`,
  alignItems: 'center',
  gap: 2,
});

function ReelAction({ icon: Icon, label, count, active, onClick }) {
  return (
    <Stack sx={{ alignItems: 'center' }}>
      <IconButton size="large" aria-label={count > 0 ? `${label}, ${count}` : label} aria-pressed={active} onClick={onClick} sx={{ color: active ? 'primary.light' : 'common.white', bgcolor: buttonBackdrop }}>
        <Icon />
      </IconButton>
      {count > 0 && <Typography variant="caption" sx={{ color: 'common.white' }}>{count.toLocaleString()}</Typography>}
    </Stack>
  );
}

// Like, comment and share down the right edge of a post. They use the same vote, comments sheet and share action as the
// feed card, so counts stay in step with it.
export default function ReelActions({ post }) {
  const vote = useVote({ targetType: 'post', targetId: post._id, score: post.score, myVote: post.myVote });
  const comments = useCommentsSheet(post);
  const share = useSharePost(post);
  const liked = vote.state.myVote === 1;
  return (
    <>
      <Stack sx={railSx}>
        <ReelAction icon={liked ? LikeFilledIcon : LikeOutlineIcon} label="Like" count={vote.state.score} active={liked} onClick={() => vote.cast(1)} />
        <ReelAction icon={CommentOutlineIcon} label="Comments" count={comments.count} onClick={comments.show} />
        <ReelAction icon={SendOutlineIcon} label="Share" onClick={share} />
      </Stack>
      <CommentsSheet raised post={post} open={comments.open} onClose={comments.hide} onCountChange={comments.changeCount} />
    </>
  );
}
