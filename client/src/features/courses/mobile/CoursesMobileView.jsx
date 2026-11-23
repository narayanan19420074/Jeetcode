import { Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Tab, Tabs } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { LibraryFont, libBackBtnSx } from '../../dashboard/components/libraryStyle';
import CoursesContent from '../common/CoursesContent';

const PHONE_MAX_WIDTH = 640;

// Phone Courses page in the Library look (no top bar on phones): back button, the two lists as tabs, then the open list.
export default function CoursesMobileView({ page }) {
  const { tab, setTab, isAuthenticated } = page;
  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: PHONE_MAX_WIDTH, mx: 'auto' }}>
        <IconButton component={RouterLink} to={isAuthenticated ? '/dashboard' : '/'} aria-label="Back to dashboard" sx={libBackBtnSx}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="fullWidth" aria-label="Browse" sx={{ mt: 1, mb: 2 }}>
          <Tab label="Courses" value="courses" />
          <Tab label="Lessons" value="lessons" />
        </Tabs>
        <CoursesContent page={page} />
      </Box>
    </LibraryFont>
  );
}
