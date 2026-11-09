import { useCallback, useEffect, useMemo, useState } from 'react';
import { studyPlanApi } from '../../../api/studyPlanApi';
import { extractErrorMessage } from '../../../api/apiClient';
import { shareUrl } from '../planUtils';

// Loads one plan and keeps it fresh: progress comes from real solves, so it refreshes when the learner
// comes back from solving something.
function usePlanDetail(id, onChanged) {
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await studyPlanApi.get(id);
      setPlan(data.data);
      setError('');
      onChanged?.();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }, [id, onChanged]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(onVisible, 60000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(timer);
    };
  }, [load]);

  return { plan, error, setError, load };
}

// Plan actions: copy the invite link, add a friend, and delete / leave / remove a member after confirmation.
export function usePlanWorkspace({ id, onChanged, onGone, notify }) {
  const { plan, error, setError, load } = usePlanDetail(id, onChanged);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState(null); // 'delete' | 'leave' | { remove: member }
  const [busy, setBusy] = useState(false);

  const membersById = useMemo(() => new Map((plan?.members || []).map((m) => [m.userId, m])), [plan]);
  const memberIds = useMemo(() => new Set((plan?.members || []).map((m) => m.userId)), [plan]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(plan.shareCode));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify?.('Could not copy. Allow clipboard access and try again.');
    }
  };

  const addFriend = async (f) => {
    try {
      await studyPlanApi.addMember(id, f.userId);
      notify?.(`${f.name} added`);
      await load();
    } catch (err) {
      notify?.(extractErrorMessage(err));
    }
  };

  const runConfirm = async () => {
    setBusy(true);
    try {
      if (confirm === 'delete') {
        await studyPlanApi.remove(id);
        onGone();
        return;
      }
      if (confirm === 'leave') {
        await studyPlanApi.leave(id);
        onGone();
        return;
      }
      await studyPlanApi.removeMember(id, confirm.remove.userId);
      setConfirm(null);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  return { plan, error, setError, copied, copy, confirm, setConfirm, busy, membersById, memberIds, addFriend, runConfirm };
}
