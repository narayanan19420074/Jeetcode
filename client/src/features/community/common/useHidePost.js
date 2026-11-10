import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import useSignInRedirect from '../../workspace/community/communityBits/useSignInRedirect';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';

// "Not interested" hides this post for the viewer; "Hide posts by ..." hides every named post of its author.
// `onRemoved` receives what to drop from the screen: { postId } or { authorId }.
export default function useHidePost(post, onRemoved) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const redirectToSignIn = useSignInRedirect();
  const { enqueueSnackbar } = useSnackbar();

  const run = (request, message, removal) => async () => {
    if (!isAuthenticated) return redirectToSignIn();
    try {
      await request(post._id);
      enqueueSnackbar(message, { variant: 'success' });
      onRemoved?.(removal);
    } catch (err) {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    }
  };
  return {
    hidePost: run(communityApi.hidePost, 'Post hidden. You will see fewer posts like this.', { postId: post._id }),
    hideAuthor: run(communityApi.hidePostAuthor, `Posts by ${post.author?.name} are now hidden.`, { authorId: post.author?._id }),
  };
}
