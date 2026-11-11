import FriendPicker from '../FriendPicker';
import { extractErrorMessage } from '../../../api/apiClient';
import { studyPlanApi } from '../../../api/studyPlanApi';

// Friends to share a plan with. Picking one sends an invitation (they appear on the plan only after they accept).
// `target` is { el, plan } while the picker is open; `notify(message)` shows the result.
export default function PlanSharePicker({ target, friends, onClose, notify, onFindFriends }) {
  const memberIds = new Set((target?.plan.members || []).map((member) => member.id));

  const sendInvite = async (friend) => {
    try {
      await studyPlanApi.invite(target.plan.id, friend.userId);
      notify(`Invite sent to ${friend.name}`);
    } catch (err) {
      notify(extractErrorMessage(err));
    }
    onClose();
  };

  return (
    <FriendPicker
      anchorEl={target?.el}
      onClose={onClose}
      friends={friends}
      memberIds={memberIds}
      onAdd={sendInvite}
      onFindFriends={onFindFriends}
      title="SHARE WITH A FRIEND"
    />
  );
}
