import { useMediaQuery, useTheme } from '@mui/material';
import useExamsPage from './common/useExamsPage';
import ExamsDesktopView from './desktop/ExamsDesktopView';
import ExamsMobileView from './mobile/ExamsMobileView';

// Thin entry: shared exams state, then the phone or desktop layout.
export default function ExamsPage() {
  const page = useExamsPage();
  const isPhone = useMediaQuery(useTheme().breakpoints.down('md'));
  return isPhone ? <ExamsMobileView page={page} /> : <ExamsDesktopView page={page} />;
}
