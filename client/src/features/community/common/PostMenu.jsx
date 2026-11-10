import { useState } from 'react';
import { useSelector } from 'react-redux';
import { IconButton, useMediaQuery } from '@mui/material';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import PostMenuOverlay from './PostMenuOverlay';
import { buildPostMenuEntries } from './postMenuEntries';
import { useSavePost } from './usePostEngagement';
import { useSharePost } from './sharePost';
import useHidePost from './useHidePost';
import useDeletePost from './useDeletePost';
import { ConfirmDialog, ReportDialog } from '../../workspace/community/CommunityBits';
import { MEDIA_QUERIES } from '../../../app/design/designTokens';

// Menu entries wired to their actions. Delete and Report only pick a dialog here; the dialogs live in PostMenu.
function usePostMenuEntries(post, onRemoved, openDialog) {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const save = useSavePost(post);
  const share = useSharePost(post);
  const hide = useHidePost(post, onRemoved);
  const actions = { toggleSave: save.toggle, share, ...hide, report: () => openDialog('report'), remove: () => openDialog('delete') };
  return buildPostMenuEntries({ post, isSaved: save.on, canReport: isAuthenticated && !post.isMine, canDelete: post.isMine || role === 'admin', actions });
}

// The "..." menu of a post: Save, Share via, Hide posts by the author, Not interested, Report post, and Delete for the owner
// or an admin. `onRemoved({ postId } | { authorId })` tells the screen which posts disappeared.
export default function PostMenu({ post, onRemoved, triggerSx }) {
  const isPhone = useMediaQuery(MEDIA_QUERIES.belowMd);
  const [anchor, setAnchor] = useState(null);
  const [dialog, setDialog] = useState('');
  const entries = usePostMenuEntries(post, onRemoved, setDialog);
  const { deleting, remove } = useDeletePost(post._id, onRemoved);
  return (
    <>
      <IconButton aria-label="More actions" aria-haspopup="true" onClick={(event) => setAnchor(event.currentTarget)} sx={triggerSx}>
        <MoreVertRoundedIcon />
      </IconButton>
      <PostMenuOverlay anchor={anchor} isPhone={isPhone} entries={entries} onClose={() => setAnchor(null)} />
      <ConfirmDialog open={dialog === 'delete'} title="Delete post?" text="This also removes its comments and cannot be undone." loading={deleting} onConfirm={remove} onClose={() => setDialog('')} />
      <ReportDialog open={dialog === 'report'} onClose={() => setDialog('')} targetType="post" targetId={post._id} />
    </>
  );
}
