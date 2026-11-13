import { useLocation, useNavigate } from 'react-router-dom';

const START_ID_KEY = 'reelsStartId';

// Whether the posts viewer is open lives in the browser history, not in component state: opening it adds a history
// entry, so the phone's Back button (and swipe-back) closes the viewer and returns to the feed, exactly like the
// on-screen back arrow.
export default function useReelsRoute() {
  const navigate = useNavigate();
  const { pathname, search, state } = useLocation();
  return {
    startId: state?.[START_ID_KEY] ?? null,
    open: (postId) => navigate({ pathname, search }, { state: { [START_ID_KEY]: postId } }),
    close: () => navigate(-1),
  };
}
