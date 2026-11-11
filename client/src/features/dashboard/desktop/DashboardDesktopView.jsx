import { useRef } from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { EASING, MOTION, SIZES } from '../../../app/design/designTokens';
import DashboardRailPane from '../components/DashboardRailPane';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardSidebarPane from '../components/DashboardSidebarPane';
import RightRail from '../components/RightRail';
import { RAIL_COLUMN_WIDTH } from '../dashboardUtils';
import useViewportFill from '../useViewportFill';
import DesktopContentColumn from './DesktopContentColumn';

// Medium screens: sidebar and content. Large screens add the streak rail as a third column, which collapses on views that do not use it.
const gridSx = (isPageOneWindowTall, showRail) => ({
  display: 'grid',
  rowGap: 3,
  columnGap: { md: 3, lg: 0 },
  alignItems: 'start',
  height: isPageOneWindowTall ? SIZES.fill : 'auto',
  gridTemplateRows: isPageOneWindowTall ? 'minmax(0, 1fr)' : undefined,
  gridTemplateColumns: { md: `${SIZES.desktopFrame.sidebar.md}px minmax(0, 1fr)`, lg: `${SIZES.desktopFrame.sidebar.lg}px minmax(0, 1fr) ${showRail ? RAIL_COLUMN_WIDTH : '0px'}` },
  transition: `grid-template-columns ${MOTION.slow}ms ${EASING.standard}`,
});

function DashboardSidebarColumn({ dashboard }) {
  const { currentView, activeList, listsApi, goView, selectList, friends, isAuthenticated } = dashboard;
  const friendCounts = isAuthenticated ? { friends: friends.friends.length, incoming: friends.incoming.length } : null;
  return (
    <DashboardSidebarPane>
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
    </DashboardSidebarPane>
  );
}

function DashboardGrid({ dashboard, isLg, isPageOneWindowTall }) {
  const { showRail, user, isAuthenticated, progress, activity } = dashboard;
  return (
    <Box sx={gridSx(isPageOneWindowTall, showRail)}>
      <DashboardSidebarColumn dashboard={dashboard} />
      <DesktopContentColumn dashboard={dashboard} isPageOneWindowTall={isPageOneWindowTall} />
      <DashboardRailPane isLg={isLg} isMdUp showRail={showRail}>
        <RightRail user={user} isAuthenticated={isAuthenticated} progress={progress} activity={activity} />
      </DashboardRailPane>
    </Box>
  );
}

// Wide screens: the page is exactly one window tall, so the sidebar and streak rail stay put while the middle column scrolls.
export default function DashboardDesktopView({ dashboard }) {
  const rootRef = useRef(null);
  const isLg = useMediaQuery(useTheme().breakpoints.up('lg'));
  const pageHeight = useViewportFill(rootRef, isLg);
  const isPageOneWindowTall = Boolean(pageHeight);
  return (
    <Box ref={rootRef} sx={isPageOneWindowTall ? { height: pageHeight, overflow: 'hidden' } : { minHeight: `calc(100vh - ${SIZES.appBarHeight.desktop}px)` }}>
      <Container maxWidth={false} sx={{ maxWidth: SIZES.dashboardMaxWidth, py: 3, px: 3, height: isPageOneWindowTall ? SIZES.fill : 'auto' }}>
        <DashboardGrid dashboard={dashboard} isLg={isLg} isPageOneWindowTall={isPageOneWindowTall} />
      </Container>
    </Box>
  );
}
