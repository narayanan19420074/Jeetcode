import { Suspense, lazy } from 'react';
import PageLoader from '../../../components/PageLoader';
import ProtectedRoute from '../../../components/ProtectedRoute';
import ContestPage from '../../contest/ContestPage';
import StudyPlannerView from '../../studyplan/StudyPlannerView';
import LeaderboardView from '../../leaderboard/LeaderboardView';
import { ExploreView, ListView, QuestsView } from '../components/DashboardViews';
import LegacyFriendsRedirect from './LegacyFriendsRedirect';

// My stats and Plans are heavier and rarely the first screen, so they load on demand.
const MyStatsPage = lazy(() => import('../../profile/YouPage'));
const PlansPage = lazy(() => import('../../store/PlansPage'));

const LazyView = ({ children }) => <Suspense fallback={<PageLoader />}>{children}</Suspense>;

function DashboardListPanel({ dashboard }) {
  const { activeList, listsApi, goView, browse } = dashboard;
  if (!activeList) return null;
  return (
    <ListView
      list={activeList}
      onRemove={(problem) => listsApi.toggleItem(activeList.id, problem)}
      onRename={(name) => listsApi.renameList(activeList.id, name)}
      onDelete={() => {
        listsApi.deleteList(activeList.id);
        goView('library');
      }}
      onBrowse={browse}
    />
  );
}

// The screen behind each sidebar entry except the library. Wide screens show it beside the sidebar,
// phones show the same screen full-screen (except a saved list, which stays inside the dashboard page).
const VIEW_RENDERERS = {
  contest: () => <ContestPage embedded />,
  quests: ({ user, isAuthenticated, checkedIn, pickRandom }) => <QuestsView user={user} isAuthenticated={isAuthenticated} checkedIn={checkedIn} onPick={pickRandom} />,
  explore: ({ browse }) => <ExploreView onBrowse={browse} />,
  plans: ({ isAuthenticated }) => <StudyPlannerView isAuthenticated={isAuthenticated} />,
  leaderboard: ({ isAuthenticated }) => <LeaderboardView isAuthenticated={isAuthenticated} />,
  friends: () => <LegacyFriendsRedirect />,
  list: (dashboard) => <DashboardListPanel dashboard={dashboard} />,
  stats: () => (
    <ProtectedRoute>
      <LazyView>
        <MyStatsPage />
      </LazyView>
    </ProtectedRoute>
  ),
  billing: () => (
    <LazyView>
      <PlansPage />
    </LazyView>
  ),
};

export default function DashboardViewContent({ dashboard }) {
  const renderView = VIEW_RENDERERS[dashboard.currentView];
  return renderView ? renderView(dashboard) : null;
}
