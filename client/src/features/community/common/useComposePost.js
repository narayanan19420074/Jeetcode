import { useState } from 'react';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';

const EMPTY_DRAFT = { title: '', body: '', category: 'general', isAnonymous: false };

// The server enforces the same limits; checking here only saves a round trip.
export const validateDraft = ({ title, body }) => {
  if (title.trim().length < 3) return 'Enter a title of at least 3 characters.';
  if (!body.trim()) return 'Write something in the post body.';
  return '';
};

export default function useComposePost(onPublished) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (value) => setDraft((previous) => ({ ...previous, [field]: value }));

  const publish = async () => {
    const problem = validateDraft(draft);
    if (problem) return setError(problem);
    setSaving(true);
    setError('');
    try {
      const { data } = await communityApi.createPost({ ...draft, title: draft.title.trim(), body: draft.body.trim() });
      setDraft(EMPTY_DRAFT);
      onPublished(data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return { draft, update, publish, saving, error, clearError: () => setError('') };
}
