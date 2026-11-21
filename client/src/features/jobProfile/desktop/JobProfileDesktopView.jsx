import { Box, Container, Stack, Typography } from '@mui/material';
import BackToDashboard from '../../../components/BackToDashboard';
import { SIZES } from '../../../app/design/designTokens';
import JobProfileGate from '../common/JobProfileGate';
import JobProfileSections from '../common/JobProfileSections';
import MemberProfileSidebar from './MemberProfileSidebar';

// Your own profile: the blocks as separate cards in a centred column, with the way back to the dashboard.
function OwnProfileLayout({ editor }) {
  return (
    <Container maxWidth="sm" sx={{ pt: 3, pb: 4 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
        <BackToDashboard />
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

// Another member's profile: no title or back button, the profile on the left and followers and more profiles on the right.
function MemberProfileLayout({ editor }) {
  return (
    <Container maxWidth="lg" sx={{ pt: 3, pb: 4 }}>
      <Box sx={{ display: 'grid', gap: 3, alignItems: 'start', gridTemplateColumns: `minmax(0, 1fr) ${SIZES.memberProfileSidebar}px` }}>
        <JobProfileGate editor={editor}>
          <JobProfileSections editor={editor} spacing={2} />
        </JobProfileGate>
        {editor.status === 'ready' && <MemberProfileSidebar editor={editor} />}
      </Box>
    </Container>
  );
}

export default function JobProfileDesktopView({ editor }) {
  return editor.readOnly ? <MemberProfileLayout editor={editor} /> : <OwnProfileLayout editor={editor} />;
}
