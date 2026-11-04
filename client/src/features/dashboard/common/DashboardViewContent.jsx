import ContestPage from '../../contest/ContestPage';
import StudyPlannerView from '../../studyplan/StudyPlannerView';
import LeaderboardView from '../../leaderboard/LeaderboardView';
import { ExploreView, ListView, QuestsView } from '../components/DashboardViews';
import FriendsPanel from './FriendsPanel';

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
export default function DashboardViewContent({ dashboard }) {
  const { currentView, user, isAuthenticated, checkedIn, pickRandom, browse } = dashboard;
  switch (currentView) {
    case 'contest':
      return <ContestPage embedded />;
    case 'quests':
      return <QuestsView user={user} isAuthenticated={isAuthenticated} checkedIn={checkedIn} onPick={pickRandom} />;
    case 'explore':
      return <ExploreView onBrowse={browse} />;
    case 'plans':
      return <StudyPlannerView isAuthenticated={isAuthenticated} />;
    case 'leaderboard':
      return <LeaderboardView isAuthenticated={isAuthenticated} />;
    case 'friends':
      return <FriendsPanel isAuthenticated={isAuthenticated} user={user} />;
    case 'list':
      return <DashboardListPanel dashboard={dashboard} />;
    default:
      return null;
  }
}
