import FriendChat from '../../../friends/FriendChat';
import { ConfirmDialog } from '../../../workspace/community/CommunityBits';
import useRemoveFriendConfirm from './useRemoveFriendConfirm';

// The chat of the Friends page, opened from the inbox in the phone Library look. Tapping the friend's name in its
// header opens their Job profile.
export default function MessageChat({ chat }) {
  const { friend, close } = chat;
  const removal = useRemoveFriendConfirm(friend, close);
  return (
    <>
      <FriendChat friend={friend} lib onClose={close} onCodeTogether={chat.codeTogether} onToggleProfile={chat.openProfile} onRemove={removal.ask} />
      {friend && (
        <ConfirmDialog open={removal.isAsking} title="Remove friend?" text={`${friend.name} will no longer be in your friends list.`} loading={removal.isRemoving} onConfirm={removal.confirm} onClose={removal.cancel} />
      )}
    </>
  );
}
