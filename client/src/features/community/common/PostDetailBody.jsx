import { useRef } from 'react';
import { Box, Divider, Stack } from '@mui/material';
import PostMeta from './PostMeta';
import PostActionBar from './PostActionBar';
import useFocusComments from './useFocusComments';
import Markdown from '../../workspace/community/Markdown';
import CommentSection from '../../workspace/community/CommentSection';

// An open post: its heading block, the text, the comment thread and the fixed action bar.
export default function PostDetailBody({ post, onCommentCountChange }) {
  const commentsRef = useRef(null);
  const focusComments = useFocusComments(commentsRef);
  return (
    <>
      <Stack spacing={2.5}>
        <PostMeta post={post} />
        <Markdown source={post.body} />
        <Divider />
        <Box ref={commentsRef}>
          <CommentSection kind="posts" targetId={post._id} onCountChange={onCommentCountChange} />
        </Box>
      </Stack>
      <PostActionBar post={post} onCommentClick={focusComments} />
    </>
  );
}
