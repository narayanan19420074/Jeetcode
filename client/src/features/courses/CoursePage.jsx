import { Navigate, useParams } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@mui/material';
import { findBuiltInCourse } from './common/builtInCourses';
import useCourseWorkspace from './workspace/common/useCourseWorkspace';
import CourseDesktopView from './workspace/desktop/CourseDesktopView';
import CourseMobileView from './workspace/mobile/CourseMobileView';

function CourseWorkspace({ course }) {
  const workspace = useCourseWorkspace(course);
  const isPhone = useMediaQuery(useTheme().breakpoints.down('md'), { noSsr: true });
  return isPhone ? <CourseMobileView workspace={workspace} /> : <CourseDesktopView workspace={workspace} />;
}

// Thin entry of /courses/:slug, the learning page of a built-in course. An unknown course goes back to the course list.
export default function CoursePage() {
  const { slug } = useParams();
  const course = findBuiltInCourse(slug);
  if (!course) return <Navigate to="/courses" replace />;
  return <CourseWorkspace key={course.slug} course={course} />;
}
