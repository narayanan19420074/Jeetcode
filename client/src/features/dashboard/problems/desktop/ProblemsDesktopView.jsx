import { useRef } from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import ProblemLibrary from '../../components/ProblemLibrary';
import useViewportFill from '../../useViewportFill';
import ProblemsHeader from './ProblemsHeader';
import SideRail from './SideRail';

const RAIL_WIDTH = 304;

// Wide screens: the page is exactly one window tall, so only the problem list and the side rail scroll.
export default function ProblemsDesktopView({ isAuthenticated, progress, featured, preset, listsApi, savedCount }) {
  const isLarge = useMediaQuery(useTheme().breakpoints.up('lg'));
  const rootRef = useRef(null);
  const fillHeight = useViewportFill(rootRef, isLarge);
  return (
    <Box ref={rootRef} sx={fillHeight ? { height: fillHeight, overflow: 'hidden' } : { minHeight: 'calc(100vh - 64px)' }}>
      <Container maxWidth={false} sx={{ maxWidth: 1240, py: 3, px: 3, height: fillHeight ? '100%' : 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <ProblemsHeader progress={progress} />
        <Box sx={{ flex: { lg: 1 }, minHeight: 0, display: 'grid', gap: 2.5, gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: `minmax(0,1fr) ${RAIL_WIDTH}px` }, gridTemplateRows: { lg: 'minmax(0,1fr)' } }}>
          <Box sx={{ order: { xs: 2, lg: 1 }, minWidth: 0, minHeight: 0 }}>
            <ProblemLibrary isAuthenticated={isAuthenticated} progress={progress} dailyId={featured?._id} preset={preset} listsApi={listsApi} height="100%" />
          </Box>
          <Box sx={{ order: { xs: 1, lg: 2 }, minWidth: 0, minHeight: 0, display: 'grid' }}>
            <SideRail progress={progress} featured={featured} savedCount={savedCount} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
