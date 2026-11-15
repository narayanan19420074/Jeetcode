import { communityApi } from '../../../../api/communityApi';
import useRemoteToggle from '../useRemoteToggle';

// Join or leave a group, subscribe or unsubscribe a newsletter. The button flips at once; `onChange(channelId, joined)`
// lets the list or page update its counter after the server accepted the change.
export default function useChannelMembership(channel, onChange) {
  return useRemoteToggle({
    initial: channel.isMember,
    enable: async () => {
      await communityApi.joinChannel(channel._id);
      onChange(channel._id, true);
    },
    disable: async () => {
      await communityApi.leaveChannel(channel._id);
      onChange(channel._id, false);
    },
  });
}
