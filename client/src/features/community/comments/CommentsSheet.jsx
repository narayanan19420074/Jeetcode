import { useMemo, useState } from 'react';
import { Alert, Box, Drawer, Skeleton, Stack, Typography } from '@mui/material';
import CommentItem from './CommentItem';
import CommentSortMenu from './CommentSortMenu';
import CommentInputBar from './CommentInputBar';
import useCommentThread from './useCommentThread';
import { buildCommentTree } from './commentTree';
import { FONT_SIZES, RADII_PX, SIZES } from '../../../app/design/designTokens';

// A fixed height, so the sheet looks the same whether a post has no comments or hundreds. It is centred and no wider than
// the reading column on large screens.
const sheetSx = {
  display: 'flex',
  flexDirection: 'column',
  height: SIZES.commentSheetHeight,
  maxWidth: SIZES.readingMaxWidth,
  mx: 'auto',
  borderRadius: `${RADII_PX.dialog} ${RADII_PX.dialog} 0 0`,
};
// The posts viewer is a full-screen dialog on the modal layer; a sheet opened from it must sit above that layer.
const raisedSx = (theme) => ({ zIndex: theme.zIndex.modal + 1 });
const handleSx = { alignSelf: 'center', flexShrink: 0, mt: 1.5, width: SIZES.sheetHandleWidth, height: SIZES.sheetHandleHeight, borderRadius: RADII_PX.pill, bgcolor: 'text.primary' };

function CommentsBody({ thread, tree, onReply }) {
  if (thread.loading) return <Skeleton variant="rounded" height={SIZES.avatar.lg * 2} sx={{ mt: 2 }} />;
  if (thread.error) return <Alert severity="error" sx={{ mt: 2 }}>{thread.error}</Alert>;
  if (tree.roots.length === 0) {
    return <Typography sx={{ py: 4, textAlign: 'center', fontSize: FONT_SIZES.bodyLg, color: 'text.secondary' }}>No comments yet. Be the first to comment.</Typography>;
  }
  return tree.roots.map((comment) => <CommentItem key={comment._id} comment={comment} repliesOf={tree.repliesOf} onReply={onReply} onDeleted={thread.remove} />);
}

// Bottom sheet with the comments of a feed post: sort menu, the comments with Like and Reply, and the comment field.
export default function CommentsSheet({ post, open, onClose, onCountChange, raised = false }) {
  const thread = useCommentThread(post._id, open, onCountChange);
  const [sort, setSort] = useState('relevant');
  const [replyTo, setReplyTo] = useState(null);
  const tree = useMemo(() => buildCommentTree(thread.comments, sort), [thread.comments, sort]);
  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} sx={raised ? raisedSx : undefined} slotProps={{ paper: { sx: sheetSx } }}>
      <Box sx={handleSx} />
      <Box sx={{ flexShrink: 0, px: 1, pt: 1 }}><CommentSortMenu value={sort} onChange={setSort} /></Box>
      <Stack sx={{ flex: 1, overflowY: 'auto', px: 1.5 }}>
        <CommentsBody thread={thread} tree={tree} onReply={setReplyTo} />
      </Stack>
      <CommentInputBar postId={post._id} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} onAdded={thread.add} />
    </Drawer>
  );
}
