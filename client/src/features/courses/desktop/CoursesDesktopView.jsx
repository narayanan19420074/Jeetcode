import DesktopPageFrame from '../../../components/DesktopPageFrame';
import { LibraryFont } from '../../dashboard/components/libraryStyle';
import SidebarOptionCard from '../../dashboard/problems/desktop/SidebarOptionCard';
import CoursesContent from '../common/CoursesContent';

const BROWSE_OPTIONS = [{ value: 'courses', label: 'Courses' }, { value: 'lessons', label: 'Lessons' }];

// Desktop Courses page in the shared page frame: the two lists on the left, the open list in the middle.
export default function CoursesDesktopView({ page }) {
  return (
    <LibraryFont>
      <DesktopPageFrame left={<SidebarOptionCard title="Browse" options={BROWSE_OPTIONS} value={page.tab} columns={1} onChange={page.setTab} />}>
        <CoursesContent page={page} />
      </DesktopPageFrame>
    </LibraryFont>
  );
}
