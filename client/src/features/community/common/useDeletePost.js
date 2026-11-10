import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';

// Deleting is permanent and also removes the post's comments, which is why the menu asks for confirmation first.
export default function useDeletePost(postId, onRemoved) {
  const { enqueueSnackbar } = useSnackbar();
  const [deleting, setDeleting] = useState(false);
  const remove = async () => {
    setDeleting(true);
    try {
      await communityApi.deletePost(postId);
      onRemoved?.({ postId });
    } catch (err) {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };
  return { deleting, remove };
}
