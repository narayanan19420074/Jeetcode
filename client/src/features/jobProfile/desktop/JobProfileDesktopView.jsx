import { Box, Container, Stack, Typography } from '@mui/material';
import BackToDashboard from '../../../components/BackToDashboard';
import JobProfileGate from '../common/JobProfileGate';
import { HistorySections, OverviewSections } from '../common/JobProfileSections';

// Desktop layout: profile summary on the left, work history on the right.
export default function JobProfileDesktopView({ editor }) {
  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
        <BackToDashboard />
        <Typography component="p" variant="h5">
          Job profile
        </Typography>
      </Stack>
      <JobProfileGate editor={editor}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2, alignItems: 'start' }}>
          <OverviewSections editor={editor} />
          <HistorySections editor={editor} />
        </Box>
      </JobProfileGate>
    </Container>
  );
}
