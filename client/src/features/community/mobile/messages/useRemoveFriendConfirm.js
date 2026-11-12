import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { removeFriend } from '../../../friends/friendsSlice';

// Removing a friend deletes the friendship for both people, so it always asks first (Nielsen: confirm destructive actions).
export default function useRemoveFriendConfirm(friend, onRemoved) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [isAsking, setIsAsking] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const confirm = async () => {
    setIsRemoving(true);
    const result = await dispatch(removeFriend(friend.userId));
    setIsRemoving(false);
    setIsAsking(false);
    const isDone = result.meta.requestStatus === 'fulfilled';
    enqueueSnackbar(isDone ? `${friend.name} was removed from your friends.` : result.payload || 'Could not remove this friend.', { variant: isDone ? 'success' : 'error' });
    if (isDone) onRemoved();
  };

  return { isAsking, isRemoving, ask: () => setIsAsking(true), cancel: () => setIsAsking(false), confirm };
}
