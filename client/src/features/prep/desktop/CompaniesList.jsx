import { Box, CircularProgress, Skeleton, Typography } from '@mui/material';
import { useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { panelSx } from '../../dashboard/components/libraryDesktopStyles';
import CompanyRow from './CompanyRow';
import { FONT_WEIGHTS } from '../../../app/design/designTokens';

const COLUMNS = { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' };
const SKELETON_ROWS = 8;

function SkeletonRows({ palette }) {
  return Array.from({ length: SKELETON_ROWS }, (_, i) => (
    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, borderBottom: `1px solid ${palette.divider}` }}>
      <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: '14px' }} />
      <Box sx={{ flex: 1 }}><Skeleton variant="text" width="55%" /><Skeleton variant="text" width="35%" /></Box>
    </Box>
  ));
}

function EmptyState({ query }) {
  return (
    <Box sx={{ py: 7, textAlign: 'center' }}>
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold }}>{query ? 'No companies match your search' : 'No companies yet'}</Typography>
      {query && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Try a different name.</Typography>}
    </Box>
  );
}

// Two columns of divider-separated rows inside one cream panel. The panel clips the last row's divider.
export default function CompaniesList({ loading, shown, hasMore, query, onOpen, sentinelRef }) {
  const palette = useLibraryPalette();
  const empty = !loading && shown.length === 0;
  return (
    <>
      <Box sx={[panelSx(palette), { p: 0, overflow: 'hidden' }]}>
        {empty ? <EmptyState query={query} /> : (
          <Box sx={{ display: 'grid', gridTemplateColumns: COLUMNS, mb: '-1px' }}>
            {loading ? <SkeletonRows palette={palette} /> : shown.map((company) => <CompanyRow key={company.key} company={company} onOpen={() => onOpen(company)} />)}
          </Box>
        )}
      </Box>
      <Box ref={sentinelRef} aria-hidden sx={{ height: 1 }} />
      {hasMore && <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={22} /></Box>}
    </>
  );
}
