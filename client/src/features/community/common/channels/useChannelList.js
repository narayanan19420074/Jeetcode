import { useCallback } from 'react';
import { communityApi } from '../../../../api/communityApi';
import usePagedList from '../usePagedList';
import { applyMembershipChange } from './channelKinds';

const PAGE_SIZE = 15;

// Groups or newsletters of one kind: everything ('discover') or only those the viewer belongs to ('mine').
export default function useChannelList(kind, scope) {
  const fetchPage = useCallback(
    async (page) => {
      const params = { kind, page, limit: PAGE_SIZE, ...(scope === 'mine' ? { mine: 'true' } : {}) };
      const { data } = await communityApi.listChannels(params);
      return { rows: data.data.items, totalPages: data.data.pagination.totalPages };
    },
    [kind, scope]
  );
  const { setItems, ...list } = usePagedList(fetchPage);

  const prepend = (channel) => setItems((previous) => [channel, ...previous]);
  const updateMembership = (channelId, joined) =>
    setItems((previous) => previous.map((channel) => (channel._id === channelId ? applyMembershipChange(channel, joined) : channel)));
  return { ...list, prepend, updateMembership };
}
