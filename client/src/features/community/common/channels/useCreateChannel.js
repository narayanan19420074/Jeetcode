import { useState } from 'react';
import { communityApi } from '../../../../api/communityApi';
import { extractErrorMessage } from '../../../../api/apiClient';
import { validateChannelDraft } from './channelValidation';

const EMPTY_DRAFT = { name: '', description: '' };

// Form state and submit for creating a group or newsletter of the given kind.
export default function useCreateChannel(kind, onCreated) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (value) => setDraft((previous) => ({ ...previous, [field]: value }));

  const submit = async () => {
    const problem = validateChannelDraft(draft);
    if (problem) return setError(problem);
    setSaving(true);
    setError('');
    try {
      const { data } = await communityApi.createChannel({ kind, name: draft.name.trim(), description: draft.description.trim() });
      setDraft(EMPTY_DRAFT);
      onCreated(data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return { draft, update, submit, saving, error, reset: () => setError('') };
}
