import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../../app/design/designTokens';

// One block of the search dropdown (Members or Posts): heading, then loading, error, empty or the result rows.
// `state` is { items, loading, error } as returned by the search hooks.
export default function SearchSection({ title, state, emptyText, renderItem }) {
  const { items, loading, error } = state;
  return (
    <Box component="section" aria-label={title} sx={{ px: 2, py: 1 }}>
      <Typography component="h2" sx={{ py: 0.5, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: 'text.secondary' }}>{title}</Typography>
      {loading && <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress size={20} aria-label={`Loading ${title}`} /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && items.length === 0 && <Typography sx={{ py: 1, fontSize: FONT_SIZES.body, color: 'text.secondary' }}>{emptyText}</Typography>}
      {!loading && !error && items.map(renderItem)}
    </Box>
  );
}
