import { Container, Stack, Typography } from '@mui/material';
import BackToDashboard from '../../../components/BackToDashboard';
import GoBackButton from '../common/GoBackButton';
import JobProfileGate from '../common/JobProfileGate';
import JobProfileSections from '../common/JobProfileSections';

// Desktop layout: the same blocks as on phones, as separate cards in a centred column.
export default function JobProfileDesktopView({ editor }) {
  return (
    <Container maxWidth="sm" sx={{ pt: 3, pb: 4 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
        {editor.readOnly ? <GoBackButton /> : <BackToDashboard />}
        <Typography component="p" variant="h5">
          Job profile
        </Typography>
      </Stack>
      <JobProfileGate editor={editor}>
        <JobProfileSections editor={editor} spacing={2} />
      </JobProfileGate>
    </Container>
  );
}
