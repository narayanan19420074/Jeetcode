import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { jobProfileApi } from '../../../../api/jobProfileApi';
import { COMMUNITY_CHAT_PARAM } from '../../common/communityChatLink';

const toChatPerson = (user) => ({ userId: String(user._id), name: user.name, handle: user.handle, avatarUrl: user.avatarUrl || null });

// Reads the member id of a chat link, removes it from the address so a refresh does not open the chat again, and hands
// the member to `onPersonFound`.
export default function useChatLink(onPersonFound) {
  const [params, setParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const memberId = params.get(COMMUNITY_CHAT_PARAM);

  useEffect(() => {
    if (!memberId) return;
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete(COMMUNITY_CHAT_PARAM);
        return next;
      },
      { replace: true }
    );
    jobProfileApi
      .getMember(memberId)
      .then(({ data }) => onPersonFound(toChatPerson(data.data.user)))
      .catch(() => enqueueSnackbar('Could not open this chat.', { variant: 'error' }));
  }, [memberId, onPersonFound, setParams, enqueueSnackbar]);
}
