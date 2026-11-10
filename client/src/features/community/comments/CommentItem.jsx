import { Box, Stack, Typography } from '@mui/material';
import CommentActions from './CommentActions';
import CommentMenu from './CommentMenu';
import FollowButton from '../common/FollowButton';
import Markdown from '../../workspace/community/Markdown';
import { UserAvatar, timeAgo } from '../../workspace/community/CommunityBits';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

function CommentHeader({ comment, onDeleted }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Typography noWrap sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth, fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold }}>{comment.author?.name}</Typography>
      <Typography sx={{ flexShrink: 0, fontSize: FONT_SIZES.body, color: 'text.secondary' }}>{timeAgo(comment.createdAt)}</Typography>
      <FollowButton compact author={comment.author} isOwn={comment.isMine} isFollowing={comment.isFollowingAuthor} />
      <CommentMenu comment={comment} onDeleted={onDeleted} />
    </Stack>
  );
}

function DeletedComment() {
  return <Typography sx={{ py: 1.5, fontSize: FONT_SIZES.body, fontStyle: 'italic', color: 'text.secondary' }}>This comment was deleted.</Typography>;
}

// One comment as on LinkedIn: avatar, name, time, Follow and "...", the text, then Like and Reply. Its replies follow, indented.
export default function CommentItem({ comment, repliesOf, onReply, onDeleted }) {
  const replies = repliesOf.get(comment._id) ?? [];
  return (
    <Box>
      {comment.isDeleted ? (
        <DeletedComment />
      ) : (
        <Stack direction="row" spacing={1} sx={{ pt: 1.5 }}>
          <UserAvatar user={comment.author} size={SIZES.avatar.sm} />
          <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
            <CommentHeader comment={comment} onDeleted={onDeleted} />
            <Markdown source={comment.body} />
            <CommentActions comment={comment} onReply={onReply} />
          </Box>
        </Stack>
      )}
      {replies.length > 0 && (
        <Box sx={{ ml: 5 }}>
          {replies.map((reply) => (
            <CommentItem key={reply._id} comment={reply} repliesOf={repliesOf} onReply={onReply} onDeleted={onDeleted} />
          ))}
        </Box>
      )}
    </Box>
  );
}
