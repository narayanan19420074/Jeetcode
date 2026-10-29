import { Box, Skeleton } from '@mui/material';
import { WS } from './wsTokens';

// Placeholder lines for a problem description that is still loading.
export function ProblemSkeletonBody() {
  return (
    <Box sx={{ pt: 0.5 }}>
      <Skeleton width="55%" height={32} />
      <Skeleton variant="rounded" width={72} height={24} sx={{ my: 1.5, borderRadius: 999 }} />
      <Skeleton height={20} />
      <Skeleton height={20} />
      <Skeleton width="80%" height={20} />
      <Skeleton variant="rounded" height={110} sx={{ mt: 3, borderRadius: `${WS.radius + 2}px` }} />
    </Box>
  );
}

// Whole workspace page while the problem loads.
export function ProblemPageSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: { xs: '100dvh', md: 'calc(100vh - 64px)' }, bgcolor: 'background.paper' }}>
      <Box sx={{ width: { xs: '100%', md: '42%' }, p: 2.5 }}>
        <Skeleton variant="rounded" height={32} width="60%" sx={{ mb: 3, borderRadius: `${WS.radius}px` }} />
        <Box sx={{ pt: 0 }}>
          <ProblemSkeletonBody />
        </Box>
      </Box>
      <Skeleton variant="rectangular" sx={{ flex: 1, display: { xs: 'none', md: 'block' } }} height="100%" />
    </Box>
  );
}
