import { Stack } from '@mui/material';
import DesktopPageFrame from '../../../components/DesktopPageFrame';
import { LibraryFont } from '../../dashboard/components/libraryStyle';
import ExamList from '../common/ExamList';
import UpcomingCard from '../common/UpcomingCard';
import YourPreparationCard from '../common/YourPreparationCard';
import ExamTypeNav from './ExamTypeNav';

function RightColumn({ page }) {
  return (
    <Stack spacing={2}>
      <UpcomingCard events={page.upcoming} />
      <YourPreparationCard tracks={page.tracks} />
    </Stack>
  );
}

// Desktop Exams in the shared page frame (same margins, column widths and hairlines as the Dashboard): exam types on
// the left, the exam cards in the middle, Upcoming and Your preparation on the right.
export default function ExamsDesktopView({ page }) {
  return (
    <LibraryFont>
      <DesktopPageFrame left={<ExamTypeNav category={page.category} onChange={page.setCategory} />} right={<RightColumn page={page} />}>
        <ExamList exams={page.exams} trackFor={page.trackFor} />
      </DesktopPageFrame>
    </LibraryFont>
  );
}
