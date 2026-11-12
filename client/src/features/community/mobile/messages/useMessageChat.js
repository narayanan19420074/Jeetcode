import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { friendsApi } from '../../../../api/friendsApi';
import { extractErrorMessage } from '../../../../api/apiClient';
import { jobProfilePathOf } from '../../../jobProfile/common/jobProfilePaths';

// Which friend's chat is open on top of the inbox, and what the chat header can do: start a coding room together
// and open the friend's Job profile (the same actions as the chat on the Friends page).
export default function useMessageChat() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [friend, setFriend] = useState(null);

  const codeTogether = async (target) => {
    try {
      const { data } = await friendsApi.roomInvite(target.userId);
      enqueueSnackbar(`Invite sent to @${target.handle}`, { variant: 'success' });
      navigate(`/room/${data.data.roomId}`);
    } catch (err) {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    }
  };

  return { friend, open: setFriend, close: () => setFriend(null), codeTogether, openProfile: () => navigate(jobProfilePathOf(friend.userId)) };
}
