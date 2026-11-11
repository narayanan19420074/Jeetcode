import { Box, Stack, Typography } from '@mui/material';
import { LibraryFont } from '../../dashboard/components/libraryStyle';
import ExamList from '../common/ExamList';
import UpcomingCard from '../common/UpcomingCard';
import YourPreparationCard from '../common/YourPreparationCard';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';

// Phone Exams: one column with the same cards as desktop. Upcoming first, then the exams, then your preparation.
export default function ExamsMobileView({ page }) {
  return (
    <LibraryFont>
      <Box sx={{ px: 2, py: 2 }}>
        <Typography component="h1" sx={{ mb: 2, fontSize: FONT_SIZES.display, fontWeight: FONT_WEIGHTS.bold }}>Exams</Typography>
        <Stack spacing={2}>
          <UpcomingCard events={page.upcoming} />
          <ExamList exams={page.exams} trackFor={page.trackFor} />
          <YourPreparationCard tracks={page.tracks} />
        </Stack>
      </Box>
    </LibraryFont>
  );
}
