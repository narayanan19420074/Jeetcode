import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery, useTheme } from '@mui/material';
import { fetchFriends } from '../../friends/friendsSlice';
import useProblemLists from '../useProblemLists';
import { todayKey } from '../dashboardUtils';
import usePromoCards from './promoCards';
import useDashboardData from './useDashboardData';
import useDashboardView from './useDashboardView';
import useNqtDismissal from './useNqtDismissal';
import useResumeAttempt from './useResumeAttempt';
import useShareLinkRedirects from './useShareLinkRedirects';
import { useBrowseProblems, usePickRandomProblem } from './useDashboardActions';

// One shared friends list for the sidebar badge, the Friends view and the leaderboard.
function useFriendsRefresh(isAuthenticated, userId) {
  const dispatch = useDispatch();
  useEffect(() => {
    if (isAuthenticated) dispatch(fetchFriends());
  }, [isAuthenticated, userId, dispatch]);
}

// The streak check-in counts once a submission was made today (an India day, like the backend streak).
const hasSubmittedToday = (activity) => {
  const today = todayKey();
  return activity.some((entry) => entry.date === today && entry.submissions > 0);
};

function useDashboardCards({ user, featured, activity, submissions }) {
  return {
    checkedIn: useMemo(() => hasSubmittedToday(activity), [activity]),
    promoCards: usePromoCards(featured, user?.isPro),
    ...useResumeAttempt(submissions),
    ...useNqtDismissal(),
  };
}

// Everything the dashboard needs, in one place: the desktop and phone views only decide how to lay it out.
export default function useDashboardState() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const friends = useSelector((state) => state.friends);
  const isMdUp = useMediaQuery(useTheme().breakpoints.up('md'));
  const listsApi = useProblemLists(user?.id);
  // Filters picked in Explore, applied to the library when it opens.
  const [preset, setPreset] = useState(null);
  useShareLinkRedirects(isAuthenticated);
  useFriendsRefresh(isAuthenticated, user?.id);
  const data = useDashboardData(isAuthenticated);
  const view = useDashboardView(listsApi);
  const browse = useBrowseProblems({ isMdUp, goView: view.goView, setPreset });
  const pickRandom = usePickRandomProblem(isAuthenticated);
  const cards = useDashboardCards({ user, ...data });
  return { isAuthenticated, user, friends, isMdUp, listsApi, preset, browse, pickRandom, ...data, ...view, ...cards };
}
