import { Alert, Box, Button, Typography } from '@mui/material';
import { PAD_X, ACC_W, DIFF_W } from './libraryConstants';
import ProblemRow from './ProblemRow';
import { ColumnHeader, SkeletonRows } from './TableBits';
import useLibraryStyles from './libraryStyles';
import { FONT_WEIGHTS } from '../../../../app/design/designTokens';

function TableHeader({ lib }) {
  const styles = useLibraryStyles();
  const sortColumn = (label, width, sortKey) => (
    <ColumnHeader label={label} width={width} sortKey={sortKey} sortValue={lib.query.sort} onSort={(sort) => lib.patch({ sort })} disabled={lib.sortDisabled} />
  );
  return (
    <Box sx={styles.headRow}>
      <Typography variant="caption" sx={[styles.headLabel, { pl: '32px' }]}>
        Title
      </Typography>
      <Box sx={{ flex: 1 }} />
      {sortColumn('Acceptance', ACC_W, 'acceptance')}
      {sortColumn('Difficulty', DIFF_W, 'difficulty')}
    </Box>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <Alert
      severity="error"
      sx={{ m: 2 }}
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          Try again
        </Button>
      }
    >
      {message}
    </Alert>
  );
}

function EmptyState({ onClear }) {
  return (
    <Box sx={{ py: 7, px: 3, textAlign: 'center' }}>
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold }}>No problems match this view</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        Loosen a filter or clear them all to see the full library.
      </Typography>
      <Button variant="outlined" onClick={onClear}>
        Clear filters
      </Button>
    </Box>
  );
}

function ProblemRows({ lib, dailyId, listsApi }) {
  return (
    <Box sx={{ opacity: lib.refetching ? 0.55 : 1, transition: 'opacity 120ms' }} aria-busy={lib.refetching}>
      {lib.items.map((problem, i) => (
        <ProblemRow key={problem._id} p={problem} index={i + 1} isDaily={problem._id === dailyId} saved={listsApi.isSaved(problem._id)} onStar={lib.handleStar} />
      ))}
      <Box ref={lib.sentinelRef} aria-hidden sx={{ height: 1 }} />
      {lib.loadingMore && <SkeletonRows count={3} />}
    </Box>
  );
}

function ListBody({ lib, dailyId, listsApi }) {
  if (lib.loading) return <SkeletonRows />;
  if (lib.items.length === 0 && !lib.error) return <EmptyState onClear={lib.clearAll} />;
  return <ProblemRows lib={lib} dailyId={dailyId} listsApi={listsApi} />;
}

function TableFooter({ shown, total }) {
  if (total <= 0) return null;
  return (
    <Box sx={(t) => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: PAD_X, py: 1.25, borderTop: `1px solid ${t.palette.divider}` })}>
      <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        Showing {shown} of {total}
      </Typography>
    </Box>
  );
}

const SCROLLER_SX = {
  flex: { lg: 1 },
  minHeight: { xs: 280, lg: 0 },
  maxHeight: { xs: '70vh', lg: 'none' },
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  scrollBehavior: 'smooth',
  outline: 'none',
};

// The problem card: column titles, the scrolling list and the "Showing x of y" footer.
export default function LibraryTable({ lib, dailyId, listsApi }) {
  const styles = useLibraryStyles();
  return (
    <Box sx={[styles.card, { overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: { lg: 1 }, minHeight: { lg: 0 } }]}>
      <TableHeader lib={lib} />
      <Box ref={lib.listRef} tabIndex={0} role="region" aria-label="Problems list. Use arrow keys to scroll." sx={SCROLLER_SX}>
        {lib.error && <ErrorBanner message={lib.error} onRetry={lib.retry} />}
        <ListBody lib={lib} dailyId={dailyId} listsApi={listsApi} />
      </Box>
      <TableFooter shown={lib.items.length} total={lib.pagination.total} />
    </Box>
  );
}
