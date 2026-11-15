import { useCallback, useEffect, useState } from 'react';
import { communityApi } from '../../../../api/communityApi';
import { extractErrorMessage } from '../../../../api/apiClient';
import { applyMembershipChange } from './channelKinds';

// One group or newsletter, loaded by id for its own page.
export default function useChannel(channelId) {
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await communityApi.getChannel(channelId);
      setChannel(data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateMembership = (_channelId, joined) => setChannel((current) => applyMembershipChange(current, joined));
  return { channel, loading, error, reload: load, updateMembership };
}
