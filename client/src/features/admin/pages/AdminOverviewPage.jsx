import { Alert, Box, Chip, CircularProgress, Container, Stack, Typography } from '@mui/material';
import useAdminOverview from '../overview/useAdminOverview';
import OverviewStatCards from '../overview/OverviewStatCards';
import RecentSignupsCard from '../overview/RecentSignupsCard';
import ProAccessCard from '../overview/ProAccessCard';
import { FONT_WEIGHTS } from '../../../app/design/designTokens';

function OverviewHeader({ queueMode }) {
  const isRedisQueue = queueMode === 'redis';
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      spacing={1.5}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h5" sx={{ fontWeight: FONT_WEIGHTS.bold }}>
          Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Platform health at a glance.
        </Typography>
      </Box>
      <Chip
        label={isRedisQueue ? 'Queue: Redis' : 'Queue: Inline (dev)'}
        color={isRedisQueue ? 'success' : 'warning'}
        variant="outlined"
        sx={{ fontWeight: FONT_WEIGHTS.bold }}
      />
    </Stack>
  );
}

export default function AdminOverviewPage() {
  const { stats, signups, loading, error } = useAdminOverview();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress aria-label="Loading overview" />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <OverviewHeader queueMode={stats.queueMode} />
          <OverviewStatCards stats={stats} />
          <ProAccessCard />
          <RecentSignupsCard signups={signups} />
        </>
      )}
    </Container>
  );
}
