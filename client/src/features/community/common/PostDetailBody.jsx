import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { PostAvatar, authorLabel } from './PostAuthor';
import PostStats from './PostStats';
import Markdown from '../../workspace/community/Markdown';
import CommentSection from '../../workspace/community/CommentSection';
import { ConfirmDialog, ItemMenu, ReportDialog, VoteBar, timeAgo } from '../../workspace/community/CommunityBits';
import { communityApi } from '../../../api/communityApi';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

function PostHeader({ post, menu }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <PostAvatar author={post.author} />
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.bodyLg }}>{authorLabel(post.author)}</Typography>
        <Typography color="text.secondary" sx={{ fontSize: FONT_SIZES.caption }}>{timeAgo(post.createdAt)}</Typography>
      </Box>
      {menu}
    </Stack>
  );
}

// Delete / report controls and their dialogs. Only the owner (or an admin) can delete.
function usePostActions(post) {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    try {
      await communityApi.deletePost(post._id);
      navigate('/community', { replace: true });
    } finally {
      setDeleting(false);
    }
  };

  const menu = (
    <ItemMenu canDelete={post.isMine || role === 'admin'} canReport={isAuthenticated && !post.isMine} onDelete={() => setConfirmOpen(true)} onReport={() => setReportOpen(true)} />
  );
  const dialogs = (
    <>
      <ConfirmDialog open={confirmOpen} title="Delete post?" text="This also removes its comments and cannot be undone." loading={deleting} onConfirm={remove} onClose={() => setConfirmOpen(false)} />
      <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} targetType="post" targetId={post._id} />
    </>
  );
  return { menu, dialogs };
}

export default function PostDetailBody({ post, onCommentCountChange }) {
  const { menu, dialogs } = usePostActions(post);
  return (
    <Stack spacing={2}>
      <PostHeader post={post} menu={menu} />
      <Typography component="h1" sx={{ fontSize: FONT_SIZES.heading, fontWeight: FONT_WEIGHTS.bold }}>{post.title}</Typography>
      <Markdown source={post.body} />
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <VoteBar targetType="post" targetId={post._id} score={post.score} myVote={post.myVote} isMine={post.isMine} />
        <PostStats score={post.score} viewCount={post.viewCount} commentCount={post.commentCount} />
      </Stack>
      <Divider />
      <CommentSection kind="posts" targetId={post._id} onCountChange={onCommentCountChange} />
      {dialogs}
    </Stack>
  );
}
