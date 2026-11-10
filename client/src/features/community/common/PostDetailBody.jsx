import { useState } from 'react';
import { Divider, Stack } from '@mui/material';
import PostMeta from './PostMeta';
import PostActionBar from './PostActionBar';
import PostBody from './PostBody';
import CommentSection from '../../workspace/community/CommentSection';

// An open post: its heading block, the text, the comment thread and the fixed action bar.
export default function PostDetailBody({ post, onCommentCountChange }) {
  // A comment written in the action bar is saved on the server; reloading the thread is how it appears in the list.
  const [threadVersion, setThreadVersion] = useState(0);
  const handleCommentPosted = () => {
    setThreadVersion((version) => version + 1);
    onCommentCountChange(1);
  };
  return (
    <>
      <Stack spacing={2.5}>
        <PostMeta post={post} />
        <PostBody source={post.body} />
        <Divider />
        <CommentSection key={threadVersion} kind="posts" targetId={post._id} onCountChange={onCommentCountChange} />
      </Stack>
      <PostActionBar post={post} onCommentPosted={handleCommentPosted} />
    </>
  );
}
