import { Stack } from '@mui/material';
import EngagementButton from '../common/EngagementButton';
import { CommentOutlineIcon, LikeFilledIcon, LikeOutlineIcon } from '../common/feedActionIcons';
import useVote from '../../workspace/community/communityBits/useVote';
import { MAX_COMMENT_DEPTH } from './commentTree';

// Like and Reply under a comment. Authors cannot like their own comment, and replies stop at the depth the server allows.
export default function CommentActions({ comment, onReply }) {
  const vote = useVote({ targetType: 'comment', targetId: comment._id, score: comment.score, myVote: comment.myVote, isMine: comment.isMine });
  const liked = vote.state.myVote === 1;
  return (
    <Stack direction="row" sx={{ ml: -1.25 }}>
      <EngagementButton icon={liked ? LikeFilledIcon : LikeOutlineIcon} label="Like" count={vote.state.score || undefined} active={liked} onClick={() => vote.cast(1)} disabled={comment.isMine} />
      {comment.depth < MAX_COMMENT_DEPTH && <EngagementButton icon={CommentOutlineIcon} label="Reply" onClick={() => onReply(comment)} />}
    </Stack>
  );
}
