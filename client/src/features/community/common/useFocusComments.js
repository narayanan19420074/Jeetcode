import { useSelector } from 'react-redux';
import useSignInRedirect from '../../workspace/community/communityBits/useSignInRedirect';

// The "Add a comment" field of the action bar: signed-in readers jump to the comment box and start typing,
// guests are sent to sign in because only accounts can comment.
export default function useFocusComments(commentsRef) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const redirectToSignIn = useSignInRedirect();
  return () => {
    if (!isAuthenticated) return redirectToSignIn();
    commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    commentsRef.current?.querySelector('textarea')?.focus({ preventScroll: true });
  };
}
