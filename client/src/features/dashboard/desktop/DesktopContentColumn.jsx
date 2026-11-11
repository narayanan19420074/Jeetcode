import { Box } from '@mui/material';
import { LAYOUT_SPACING, SIZES } from '../../../app/design/designTokens';
import DashboardViewSwitch from '../common/DashboardViewSwitch';
import LibraryPane from '../common/LibraryPane';
import DesktopLibraryContent from './DesktopLibraryContent';

// When the page is exactly one window tall, only this middle column scrolls (views with their own list scroll that list instead).
const scrollingColumnSx = (ownScroll) => ({
  height: SIZES.fill,
  overflowY: ownScroll ? 'hidden' : 'auto',
  overflowX: 'hidden',
  scrollbarGutter: ownScroll ? 'auto' : 'stable',
});

export default function DesktopContentColumn({ dashboard, isPageOneWindowTall }) {
  return (
    <Box
      component="section"
      className="autohide-scroll"
      aria-label="Dashboard content"
      sx={{ minWidth: SIZES.flexShrinkMinWidth, minHeight: SIZES.flexShrinkMinHeight, px: LAYOUT_SPACING.frameContentGutter, ...(isPageOneWindowTall && scrollingColumnSx(dashboard.ownScroll)) }}
    >
      <LibraryPane active={dashboard.currentView === 'library'}>
        <DesktopLibraryContent dashboard={dashboard} />
      </LibraryPane>
      <DashboardViewSwitch dashboard={dashboard} />
    </Box>
  );
}
