import { useSelector } from 'react-redux';
import { ConfirmDialog } from '../../../workspace/community/CommunityBits';
import ChatScreen from './chat/ChatScreen';
import useRemoveFriendConfirm from './useRemoveFriendConfirm';
import { selectIsFriend } from '../../../friends/friendsSlice';

// The chat opened from the inbox, in the LinkedIn layout. Its "..." menu opens the member's Job profile. For a friend it
// also sends a pair room invitation or removes the friend (after a confirmation); other members have only the profile.
export default function MessageChat({ chat }) {
  const { friend, close } = chat;
  const removal = useRemoveFriendConfirm(friend, close);
  const isFriend = useSelector(selectIsFriend(friend?.userId));
  const friendActions = { invitePairRoom: () => chat.codeTogether(friend), removeFriend: removal.ask };
  const actions = { openProfile: chat.openProfile, ...(isFriend ? friendActions : {}) };
  return (
    <>
      <ChatScreen friend={friend} onClose={close} actions={actions} />
      {friend && (
        <ConfirmDialog open={removal.isAsking} title="Remove friend?" text={`${friend.name} will no longer be in your friends list.`} loading={removal.isRemoving} onConfirm={removal.confirm} onClose={removal.cancel} />
      )}
    </>
  );
}
