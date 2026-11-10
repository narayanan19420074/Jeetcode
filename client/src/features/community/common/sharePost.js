import { useSnackbar } from 'notistack';

export const postUrl = (postId) => `${window.location.origin}/community/${postId}`;

// Opens the phone's share sheet when there is one, otherwise copies the link. Returns what happened so the caller can
// confirm a copy; closing the share sheet is not an error.
export async function sharePostLink(post) {
  const url = postUrl(post._id);
  if (navigator.share) {
    try {
      await navigator.share({ title: post.title, url });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
    }
  }
  await navigator.clipboard.writeText(url);
  return 'copied';
}

export function useSharePost(post) {
  const { enqueueSnackbar } = useSnackbar();
  return async () => {
    try {
      if ((await sharePostLink(post)) === 'copied') enqueueSnackbar('Link copied', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not share this post. Please try again.', { variant: 'error' });
    }
  };
}
