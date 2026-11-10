import { useState } from 'react';
import { useSelector } from 'react-redux';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import useDeleteComment from './useDeleteComment';
import { ConfirmDialog, ItemMenu, ReportDialog } from '../../workspace/community/CommunityBits';

// The "..." of a comment: Delete for its author (or an admin), Report for everyone else who is signed in.
export default function CommentMenu({ comment, onDeleted }) {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const [dialog, setDialog] = useState('');
  const { deleting, remove } = useDeleteComment(comment._id, onDeleted);
  return (
    <>
      <ItemMenu
        size="small"
        icon={MoreVertRoundedIcon}
        canDelete={comment.isMine || role === 'admin'}
        canReport={isAuthenticated && !comment.isMine}
        onDelete={() => setDialog('delete')}
        onReport={() => setDialog('report')}
      />
      <ConfirmDialog open={dialog === 'delete'} title="Delete comment?" text="Replies stay, but this comment will show as deleted." loading={deleting} onConfirm={remove} onClose={() => setDialog('')} />
      <ReportDialog open={dialog === 'report'} onClose={() => setDialog('')} targetType="comment" targetId={comment._id} />
    </>
  );
}
