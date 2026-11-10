import { Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { LibraryFont, libBackBtnSx } from '../../dashboard/components/libraryStyle';
import { SIZES } from '../../../app/design/designTokens';
import JobProfileGate from '../common/JobProfileGate';
import JobProfileSections from '../common/JobProfileSections';

// Phone layout: full-width blocks separated by a grey band, like the LinkedIn app. The top bar is hidden on
// this page, so it has its own back and settings buttons.
export default function JobProfileMobileView({ editor }) {
  return (
    <LibraryFont>
      <Box sx={{ pt: 'env(safe-area-inset-top)', pb: 2, maxWidth: SIZES.readingMaxWidth, mx: 'auto', bgcolor: 'action.hover' }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, bgcolor: 'background.paper' }}>
          <IconButton component={RouterLink} to="/dashboard" aria-label="Back to dashboard" sx={libBackBtnSx}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography component="p" variant="subtitle1">
            Job profile
          </Typography>
          <IconButton component={RouterLink} to="/settings" aria-label="Settings">
            <SettingsRoundedIcon />
          </IconButton>
        </Stack>
        <JobProfileGate editor={editor}>
          <Box sx={{ mt: 1 }}>
            <JobProfileSections editor={editor} spacing={1} />
          </Box>
        </JobProfileGate>
      </Box>
    </LibraryFont>
  );
}
