import { ConfirmDialog } from '../../../workspace/community/CommunityBits';
import ChatScreen from './chat/ChatScreen';
import useRemoveFriendConfirm from './useRemoveFriendConfirm';

// The chat opened from the inbox, in the LinkedIn layout. Its "..." menu opens the friend's Job profile, sends a pair
// room invitation or removes the friend (after a confirmation).
export default function MessageChat({ chat }) {
  const { friend, close } = chat;
  const removal = useRemoveFriendConfirm(friend, close);
  const actions = { openProfile: chat.openProfile, invitePairRoom: () => chat.codeTogether(friend), removeFriend: removal.ask };
  return (
    <>
      <ChatScreen friend={friend} onClose={close} actions={actions} />
      {friend && (
        <ConfirmDialog open={removal.isAsking} title="Remove friend?" text={`${friend.name} will no longer be in your friends list.`} loading={removal.isRemoving} onConfirm={removal.confirm} onClose={removal.cancel} />
      )}
    </>
  );
}
