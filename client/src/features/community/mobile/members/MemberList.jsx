import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../../app/design/designTokens';
import MemberRow from './MemberRow';

// The accounts of a search or of the Accounts tab: loading, error and empty states, then one row per member.
// `state` is { items, loading, error } as returned by useMemberSearch and useSuggestedMembers.
export default function MemberList({ state, heading, emptyText }) {
  const { items, loading, error } = state;
  if (loading) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress aria-label="Loading members" /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  return (
    <Box sx={{ pt: 1 }}>
      <Typography component="h2" sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold, py: 1 }}>{heading}</Typography>
      {items.length === 0 && <Typography sx={{ py: 4, textAlign: 'center', fontSize: FONT_SIZES.body, color: 'var(--lib-muted)' }}>{emptyText}</Typography>}
      {items.map((member) => <MemberRow key={member.userId} member={member} />)}
    </Box>
  );
}
