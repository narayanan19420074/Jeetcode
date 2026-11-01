import { Box, Skeleton, Typography } from '@mui/material';

// Placeholder shown while the assistant prepares the next card.
// role="status" lets screen readers announce the wait (WCAG 4.1.3).
export default function CardLoader() {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{ p: 2.5, borderRadius: 4, bgcolor: 'var(--lib-chip)', border: '1px solid var(--lib-border)' }}
    >
      <Typography variant="caption" sx={{ color: 'var(--lib-muted)' }}>
        Preparing your next question…
      </Typography>
      <Skeleton variant="text" width="70%" height={32} />
      <Skeleton variant="rounded" height={52} sx={{ mt: 1, borderRadius: 3 }} />
      <Skeleton variant="rounded" height={52} sx={{ mt: 1, borderRadius: 3 }} />
    </Box>
  );
}
