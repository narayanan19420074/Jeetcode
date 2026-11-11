import { useRef } from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { SIZES } from '../../../../app/design/designTokens';
import ProblemLibrary from '../../components/ProblemLibrary';
import useViewportFill from '../../useViewportFill';
import ProblemsHeader from './ProblemsHeader';
import SideRail from './SideRail';

// Wide screens: the page is exactly one window tall, so only the problem list and the side rail scroll.
export default function ProblemsDesktopView({ isAuthenticated, progress, featured, preset, listsApi, savedCount }) {
  const isLarge = useMediaQuery(useTheme().breakpoints.up('lg'));
  const rootRef = useRef(null);
  const fillHeight = useViewportFill(rootRef, isLarge);
  return (
    <Box ref={rootRef} sx={fillHeight ? { height: fillHeight, overflow: 'hidden' } : { minHeight: `calc(100vh - ${SIZES.appBarHeight.desktop}px)` }}>
      <Container maxWidth={false} sx={{ maxWidth: SIZES.dashboardMaxWidth, py: 3, px: 3, height: fillHeight ? SIZES.fill : 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <ProblemsHeader progress={progress} />
        <Box sx={{ flex: { lg: 1 }, minHeight: 0, display: 'grid', gap: 3, gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: `minmax(0,1fr) ${SIZES.desktopFrame.rail}px` }, gridTemplateRows: { lg: 'minmax(0,1fr)' } }}>
          <Box sx={{ order: { xs: 2, lg: 1 }, minWidth: 0, minHeight: 0 }}>
            <ProblemLibrary isAuthenticated={isAuthenticated} progress={progress} dailyId={featured?._id} preset={preset} listsApi={listsApi} height={SIZES.fill} />
          </Box>
          <Box sx={{ order: { xs: 1, lg: 2 }, minWidth: 0, minHeight: 0, display: 'grid' }}>
            <SideRail progress={progress} featured={featured} savedCount={savedCount} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
