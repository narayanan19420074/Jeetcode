import { useState } from 'react';
import useImageUploads from './useImageUploads';
import { appendImages } from './postImages';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';

const EMPTY_DRAFT = { title: '', body: '', category: 'general', isAnonymous: false, images: [] };

// The server enforces the same limits; checking here only saves a round trip. A post may consist of images alone.
export const validateDraft = ({ title, body, images }) => {
  if (title.trim().length < 3) return 'Enter a title of at least 3 characters.';
  if (!body.trim() && images.length === 0) return 'Write something in the post body or add an image.';
  return '';
};

const toPostPayload = (draft) => ({
  title: draft.title.trim(),
  category: draft.category,
  isAnonymous: draft.isAnonymous,
  body: appendImages(draft.body.trim(), draft.images),
});

export default function useComposePost(onPublished) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (value) => setDraft((previous) => ({ ...previous, [field]: value }));
  const imageUploads = useImageUploads({ images: draft.images, setImages: update('images'), setError });

  const publish = async () => {
    const problem = validateDraft(draft) || (imageUploads.uploading ? 'Wait for the image upload to finish.' : '');
    if (problem) return setError(problem);
    setSaving(true);
    setError('');
    try {
      const { data } = await communityApi.createPost(toPostPayload(draft));
      setDraft(EMPTY_DRAFT);
      onPublished(data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return { draft, update, publish, saving, error, clearError: () => setError(''), imageUploads };
}
