import { Box } from '@mui/material';
import { LAYOUT_SPACING, SIZES } from '../../../../app/design/designTokens';
import { ProblemLibraryView } from '../../components/ProblemLibrary';
import useProblemLibrary from '../../components/library/useProblemLibrary';
import DesktopFrame from '../../desktop/DesktopFrame';
import ProblemsRail from './ProblemsRail';
import ProblemsSidebar from './ProblemsSidebar';

// Middle column: only the problem list scrolls, so the sidebar and the rail stay put like on the dashboard.
function ProblemsContentColumn({ isPageOneWindowTall, ...libraryProps }) {
  return (
    <Box
      component="section"
      aria-label="Problems"
      sx={{ minWidth: SIZES.flexShrinkMinWidth, minHeight: SIZES.flexShrinkMinHeight, px: LAYOUT_SPACING.frameContentGutter, height: isPageOneWindowTall ? SIZES.fill : 'auto' }}
    >
      <ProblemLibraryView {...libraryProps} height={SIZES.fill} topicsInSidebar />
    </Box>
  );
}

// Wide screens: same three-column frame as the dashboard. Topics and the filter live in the sidebar, the library in the middle.
export default function ProblemsDesktopView({ isAuthenticated, progress, featured, preset, listsApi }) {
  const lib = useProblemLibrary({ preset, listsApi });
  return (
    <DesktopFrame
      sidebar={<ProblemsSidebar lib={lib} isAuthenticated={isAuthenticated} listsApi={listsApi} />}
      rail={<ProblemsRail progress={progress} featured={featured} />}
      renderContent={(isPageOneWindowTall) => (
        <ProblemsContentColumn isPageOneWindowTall={isPageOneWindowTall} lib={lib} isAuthenticated={isAuthenticated} progress={progress} dailyId={featured?._id} listsApi={listsApi} />
      )}
    />
  );
}
