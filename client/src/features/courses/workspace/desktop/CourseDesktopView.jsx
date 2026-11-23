import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import BackIconButton from '../../../../components/BackIconButton';
import DesktopPageFrame from '../../../../components/DesktopPageFrame';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../../app/design/designTokens';
import { LIB_TRACKING, LibraryFont } from '../../../dashboard/components/libraryStyle';
import { useLibraryCardSx } from '../../../dashboard/components/libraryCardStyles';
import CourseProgress from '../../common/CourseProgress';
import ExercisesPanel from '../common/ExercisesPanel';
import LessonView from '../common/LessonView';
import TopicsList from '../common/TopicsList';

const scrollingPaneSx = { maxHeight: SIZES.courseWorkspace.paneMaxHeight, overflowY: 'auto' };

// Left column: the way back, the course title and progress, then every topic. It scrolls by itself, so a long course
// never pushes the lesson out of view.
function TopicsPane({ workspace }) {
  const cardSx = useLibraryCardSx();
  const { course, progress, current, doneSet, selectLesson } = workspace;
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box><BackIconButton to="/courses" label="Back to courses" /></Box>
      <Box sx={{ ...cardSx, ...scrollingPaneSx, display: 'block' }}>
        <Typography component="h2" sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold, letterSpacing: LIB_TRACKING }}>{course.name}</Typography>
        <Box sx={{ mt: 1 }}><CourseProgress progress={progress} name={course.name} /></Box>
        <TopicsList course={course} currentKey={current.key} doneSet={doneSet} onSelect={selectLesson} />
      </Box>
    </Box>
  );
}

// Desktop learning page: topics on the left, the lesson in the main area and the exercises on the right. Below the
// large breakpoint the frame has no right column, so the exercises follow the lesson instead.
export default function CourseDesktopView({ workspace }) {
  const hasRightColumn = useMediaQuery(useTheme().breakpoints.up('lg'), { noSsr: true });
  const { current } = workspace;
  const exercises = <Box sx={scrollingPaneSx}><ExercisesPanel lessonKey={current.key} exercises={current.lesson.exercises} /></Box>;
  return (
    <LibraryFont>
      <DesktopPageFrame left={<TopicsPane workspace={workspace} />} right={hasRightColumn ? exercises : undefined}>
        <LessonView workspace={workspace} />
        {!hasRightColumn && <Box sx={{ mt: 4 }}>{exercises}</Box>}
      </DesktopPageFrame>
    </LibraryFont>
  );
}
