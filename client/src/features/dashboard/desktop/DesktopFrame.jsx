import { useRef } from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { EASING, MOTION, SIZES } from '../../../app/design/designTokens';
import DashboardRailPane from '../components/DashboardRailPane';
import DashboardSidebarPane from '../components/DashboardSidebarPane';
import { RAIL_COLUMN_WIDTH } from '../dashboardUtils';
import useViewportFill from '../useViewportFill';

// Medium screens: sidebar and content. Large screens add the right rail as a third column, which collapses when a view does not use it.
const gridSx = (isPageOneWindowTall, showRail, hasRail) => ({
  display: 'grid',
  rowGap: 3,
  columnGap: { md: 3, lg: 0 },
  alignItems: 'start',
  height: isPageOneWindowTall ? SIZES.fill : 'auto',
  gridTemplateRows: isPageOneWindowTall ? 'minmax(0, 1fr)' : undefined,
  gridTemplateColumns: { md: `${SIZES.desktopFrame.sidebar.md}px minmax(0, 1fr)`, lg: hasRail ? `${SIZES.desktopFrame.sidebar.lg}px minmax(0, 1fr) ${showRail ? RAIL_COLUMN_WIDTH : '0px'}` : `${SIZES.desktopFrame.sidebar.lg}px minmax(0, 1fr)` },
  transition: `grid-template-columns ${MOTION.slow}ms ${EASING.standard}`,
});

// One desktop page frame shared by the Dashboard and Problems pages, so both keep the same columns, borders and spacing.
// Wide screens make the page exactly one window tall: the sidebar and the rail stay put while the middle column scrolls.
// `renderContent` receives that flag, because the middle column needs it to size itself. Pages without a right rail (Settings) omit `rail`.
export default function DesktopFrame({ sidebar, rail, showRail = true, renderContent }) {
  const rootRef = useRef(null);
  const isLg = useMediaQuery(useTheme().breakpoints.up('lg'));
  const pageHeight = useViewportFill(rootRef, isLg);
  const isPageOneWindowTall = Boolean(pageHeight);
  return (
    <Box ref={rootRef} sx={isPageOneWindowTall ? { height: pageHeight, overflow: 'hidden' } : { minHeight: `calc(100vh - ${SIZES.appBarHeight.desktop}px)` }}>
      <Container maxWidth={false} sx={{ maxWidth: SIZES.dashboardMaxWidth, py: 3, px: 3, height: isPageOneWindowTall ? SIZES.fill : 'auto' }}>
        <Box sx={gridSx(isPageOneWindowTall, showRail, Boolean(rail))}>
          <DashboardSidebarPane>{sidebar}</DashboardSidebarPane>
          {renderContent(isPageOneWindowTall)}
          {rail && (
            <DashboardRailPane isLg={isLg} isMdUp showRail={showRail}>
              {rail}
            </DashboardRailPane>
          )}
        </Box>
      </Container>
    </Box>
  );
}
