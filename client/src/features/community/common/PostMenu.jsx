import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { ConfirmDialog, ItemMenu, ReportDialog } from '../../workspace/community/CommunityBits';
import { libIconBtnSx } from '../../dashboard/components/libraryStyle';
import { communityApi } from '../../../api/communityApi';

function useDeletePost(postId) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const remove = async () => {
    setDeleting(true);
    try {
      await communityApi.deletePost(postId);
      navigate('/community', { replace: true });
    } finally {
      setDeleting(false);
    }
  };
  return { deleting, remove };
}

// The "..." button of an open post. Only the owner (or an admin) can delete; everyone else signed in can report.
export default function PostMenu({ post }) {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { deleting, remove } = useDeletePost(post._id);
  return (
    <Box sx={{ '& .MuiIconButton-root': libIconBtnSx }}>
      <ItemMenu canDelete={post.isMine || role === 'admin'} canReport={isAuthenticated && !post.isMine} onDelete={() => setConfirmOpen(true)} onReport={() => setReportOpen(true)} />
      <ConfirmDialog open={confirmOpen} title="Delete post?" text="This also removes its comments and cannot be undone." loading={deleting} onConfirm={remove} onClose={() => setConfirmOpen(false)} />
      <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} targetType="post" targetId={post._id} />
    </Box>
  );
}
