import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Tab, Tabs, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../../app/design/designTokens';
import { LibraryFont, libBackBtnSx } from '../../../dashboard/components/libraryStyle';
import CourseProgress from '../../common/CourseProgress';
import ExercisesPanel from '../common/ExercisesPanel';
import LessonView from '../common/LessonView';
import TopicsList from '../common/TopicsList';

function MobileTabContent({ tab, workspace, onOpenLesson }) {
  const { course, current, doneSet } = workspace;
  if (tab === 'topics') return <TopicsList course={course} currentKey={current.key} doneSet={doneSet} onSelect={onOpenLesson} />;
  if (tab === 'exercises') return <ExercisesPanel lessonKey={current.key} exercises={current.lesson.exercises} />;
  return <LessonView workspace={workspace} />;
}

// Phone learning page. The three areas of the desktop layout become tabs: Lesson, Topics and Exercises. Choosing a topic
// opens its lesson straight away.
export default function CourseMobileView({ workspace }) {
  const [tab, setTab] = useState('lesson');
  const { course, progress, current, selectLesson } = workspace;
  const openLesson = (key) => {
    selectLesson(key);
    setTab('lesson');
  };
  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 4, maxWidth: SIZES.phonePageMaxWidth, mx: 'auto' }}>
        <IconButton component={RouterLink} to="/courses" aria-label="Back to courses" sx={libBackBtnSx}><ArrowBackRoundedIcon /></IconButton>
        <Typography component="h1" sx={{ fontSize: FONT_SIZES.heading, fontWeight: FONT_WEIGHTS.bold }}>{course.name}</Typography>
        <Box sx={{ mt: 1 }}><CourseProgress progress={progress} name={course.name} /></Box>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="fullWidth" aria-label="Course sections" sx={{ my: 2 }}>
          <Tab label="Lesson" value="lesson" />
          <Tab label="Topics" value="topics" />
          <Tab label={`Exercises (${current.lesson.exercises.length})`} value="exercises" />
        </Tabs>
        <MobileTabContent tab={tab} workspace={workspace} onOpenLesson={openLesson} />
      </Box>
    </LibraryFont>
  );
}
