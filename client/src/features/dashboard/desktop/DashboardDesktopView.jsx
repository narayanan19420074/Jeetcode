import DashboardSidebar from '../components/DashboardSidebar';
import RightRail from '../components/RightRail';
import DesktopContentColumn from './DesktopContentColumn';
import DesktopFrame from './DesktopFrame';

function DashboardSidebarColumn({ dashboard }) {
  const { currentView, activeList, listsApi, goView, selectList, friends, isAuthenticated } = dashboard;
  const friendCounts = isAuthenticated ? { friends: friends.friends.length, incoming: friends.incoming.length } : null;
  return (
    <DashboardSidebar
      view={currentView}
      activeListId={activeList?.id}
      lists={listsApi.lists}
      maxLists={listsApi.maxLists}
      onView={goView}
      onSelectList={selectList}
      onCreateList={listsApi.createList}
      friendCounts={friendCounts}
    />
  );
}

// Wide screens: the shared desktop frame holds the sidebar, the middle column and the streak rail.
export default function DashboardDesktopView({ dashboard }) {
  const { showRail, user, isAuthenticated, progress, activity } = dashboard;
  return (
    <DesktopFrame
      showRail={showRail}
      sidebar={<DashboardSidebarColumn dashboard={dashboard} />}
      rail={<RightRail user={user} isAuthenticated={isAuthenticated} progress={progress} activity={activity} />}
      renderContent={(isPageOneWindowTall) => <DesktopContentColumn dashboard={dashboard} isPageOneWindowTall={isPageOneWindowTall} />}
    />
  );
}
