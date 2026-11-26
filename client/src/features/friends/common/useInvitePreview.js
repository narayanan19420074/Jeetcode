import { useEffect, useState } from 'react';
import { friendsApi } from '../../../api/friendsApi';
import { extractErrorMessage } from '../../../api/apiClient';

// Who sent a shared friend invite link (?invite=handle): the member, whether it is the person's own link, and whether
// they are already friends. Loading, a missing member or a server error are part of the returned state.
export default function useInvitePreview(handle) {
  const [preview, setPreview] = useState({ loading: true });
  useEffect(() => {
    let cancelled = false;
    setPreview({ loading: true });
    friendsApi
      .previewInvite(handle)
      .then(({ data }) => !cancelled && setPreview({ loading: false, ...data.data }))
      .catch((err) => !cancelled && setPreview({ loading: false, error: extractErrorMessage(err) }));
    return () => { cancelled = true; };
  }, [handle]);
  return preview;
}
