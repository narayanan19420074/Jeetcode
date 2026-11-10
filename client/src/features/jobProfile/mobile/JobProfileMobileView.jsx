import { Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { LibraryFont, libBackBtnSx } from '../../dashboard/components/libraryStyle';
import { SIZES } from '../../../app/design/designTokens';
import JobProfileGate from '../common/JobProfileGate';
import { HistorySections, OverviewSections } from '../common/JobProfileSections';

// Phone layout: the Library look with its own back header (the top bar is hidden on this page), one column.
export default function JobProfileMobileView({ editor }) {
  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: SIZES.readingMaxWidth, mx: 'auto' }}>
        <Stack direction="row" sx={{ alignItems: 'center', mb: 1 }}>
          <IconButton component={RouterLink} to="/dashboard" aria-label="Back to dashboard" sx={libBackBtnSx}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography component="p" variant="h6" sx={{ flex: 1, textAlign: 'center', mr: 4 }}>
            Job profile
          </Typography>
        </Stack>
        <JobProfileGate editor={editor}>
          <Stack spacing={2}>
            <OverviewSections editor={editor} />
            <HistorySections editor={editor} />
          </Stack>
        </JobProfileGate>
      </Box>
    </LibraryFont>
  );
}
