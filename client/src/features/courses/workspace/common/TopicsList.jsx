import { Box, ButtonBase, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import { tint } from '../../../dashboard/dashboardUtils';
import { LIB_ACCENT, LIB_TRACKING, useLibraryPalette } from '../../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../../app/design/designTokens';
import { COURSE_LEVELS } from '../../content/courseLevels';
import { lessonKeyOf } from '../../common/builtInCourses';

const SELECTED_TINT_PERCENT = 14;

function LessonRow({ lesson, lessonKey, isCurrent, isDone, onSelect }) {
  const palette = useLibraryPalette();
  const StatusIcon = isDone ? CheckCircleRoundedIcon : RadioButtonUncheckedRoundedIcon;
  return (
    <ButtonBase onClick={() => onSelect(lessonKey)} aria-current={isCurrent ? 'true' : undefined} sx={{ justifyContent: 'flex-start', gap: 1, width: SIZES.fill, minHeight: SIZES.navItemHeightDense, px: 1, py: 0.5, textAlign: 'left', fontFamily: 'inherit', borderRadius: RADII_PX.control, bgcolor: isCurrent ? tint(LIB_ACCENT, SELECTED_TINT_PERCENT) : 'transparent' }}>
      <StatusIcon titleAccess={isDone ? 'Completed' : 'Not completed'} sx={{ fontSize: FONT_SIZES.subheading, flexShrink: 0, color: isDone ? 'success.main' : palette.muted }} />
      <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: isCurrent ? FONT_WEIGHTS.bold : FONT_WEIGHTS.regular, letterSpacing: LIB_TRACKING }}>{lesson.title}</Typography>
    </ButtonBase>
  );
}

function ModuleGroup({ courseModule, currentKey, doneSet, onSelect }) {
  const palette = useLibraryPalette();
  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography sx={{ px: 1, mb: 0.5, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.semibold, color: palette.muted }}>{courseModule.title}</Typography>
      {courseModule.lessons.map((lesson) => {
        const lessonKey = lessonKeyOf(courseModule, lesson);
        return <LessonRow key={lessonKey} lesson={lesson} lessonKey={lessonKey} isCurrent={lessonKey === currentKey} isDone={doneSet.has(lessonKey)} onSelect={onSelect} />;
      })}
    </Box>
  );
}

function LevelGroup({ level, modules, ...rest }) {
  return (
    <Box component="section" aria-label={`${level.label} topics`} sx={{ mt: 2 }}>
      <Typography component="h2" sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold, letterSpacing: LIB_TRACKING }}>{level.label}</Typography>
      {modules.map((courseModule) => <ModuleGroup key={courseModule.id} courseModule={courseModule} {...rest} />)}
    </Box>
  );
}

// Topics of the course grouped under Beginner, Intermediate and Advanced, each module with its lessons in learning order.
// Shared by the desktop sidebar and the phone Topics tab.
export default function TopicsList({ course, currentKey, doneSet, onSelect }) {
  return COURSE_LEVELS.map((level) => {
    const modules = course.modules.filter((courseModule) => courseModule.level === level.id);
    if (modules.length === 0) return null;
    return <LevelGroup key={level.id} level={level} modules={modules} currentKey={currentKey} doneSet={doneSet} onSelect={onSelect} />;
  });
}
