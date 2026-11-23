import { useMediaQuery, useTheme } from '@mui/material';
import { PurchaseDialogs } from '../store/common/StoreDialogs';
import useCoursesPage from './common/useCoursesPage';
import CoursesDesktopView from './desktop/CoursesDesktopView';
import CoursesMobileView from './mobile/CoursesMobileView';

// Thin entry of /courses: loads the shared state once and picks the phone or the desktop layout. Buying a course and
// opening its syllabus reuse the Store dialogs, so a purchase works the same here as in the Store.
export default function CoursesPage() {
  const page = useCoursesPage();
  const isPhone = useMediaQuery(useTheme().breakpoints.down('md'), { noSsr: true });
  return (
    <>
      {isPhone ? <CoursesMobileView page={page} /> : <CoursesDesktopView page={page} />}
      <PurchaseDialogs store={page} />
    </>
  );
}
