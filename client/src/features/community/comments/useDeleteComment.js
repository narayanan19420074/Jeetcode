import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';

export default function useDeleteComment(commentId, onDeleted) {
  const { enqueueSnackbar } = useSnackbar();
  const [deleting, setDeleting] = useState(false);
  const remove = async () => {
    setDeleting(true);
    try {
      const { data } = await communityApi.deleteComment(commentId);
      onDeleted(commentId, data.data.soft);
    } catch (err) {
      setDeleting(false);
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    }
  };
  return { deleting, remove };
}
