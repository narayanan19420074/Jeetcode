import DesktopPageFrame from '../../../components/DesktopPageFrame';
import { LibraryFont } from '../../dashboard/components/libraryStyle';
import CoursesContent from '../common/CoursesContent';
import CoursesSidebar from './CoursesSidebar';

// Desktop Courses page in the shared page frame: the way back and the two lists on the left, the open list in the middle.
export default function CoursesDesktopView({ page }) {
  return (
    <LibraryFont>
      <DesktopPageFrame left={<CoursesSidebar tab={page.tab} onPick={page.setTab} />}>
        <CoursesContent page={page} />
      </DesktopPageFrame>
    </LibraryFont>
  );
}
