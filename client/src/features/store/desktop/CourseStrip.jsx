import { Box, ButtonBase, Typography } from '@mui/material';
import { tint } from '../../dashboard/dashboardUtils';
import { LIB_ACCENT, LIB_TRACKING, libSectionTitleSx, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { panelSx } from '../../dashboard/components/libraryDesktopStyles';
import { FONT_WEIGHTS, FONT_SIZES } from '../../../app/design/designTokens';

function CourseCard({ course, onOpen, palette }) {
  const { doneCount, lessonCount, percent } = course.progress;
  return (
    <ButtonBase onClick={() => onOpen(course.slug)} sx={{ display: 'block', p: 2, textAlign: 'left', fontFamily: 'inherit', borderRadius: '16px', color: palette.text, bgcolor: palette.player }}>
      <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, letterSpacing: LIB_TRACKING }}>{course.name}</Typography>
      <Typography sx={{ fontSize: FONT_SIZES.body, mt: 0.4, color: palette.muted, fontVariantNumeric: 'tabular-nums' }}>{doneCount}/{lessonCount} lessons</Typography>
      <Box role="progressbar" aria-label={`${course.name} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} sx={{ mt: 1.25, height: 5, borderRadius: 99, bgcolor: tint(LIB_ACCENT, 20), overflow: 'hidden' }}>
        <Box sx={{ width: `${percent}%`, height: '100%', borderRadius: 99, bgcolor: LIB_ACCENT }} />
      </Box>
    </ButtonBase>
  );
}

// Courses the learner already owns, so they can resume from the Store.
export default function CourseStrip({ courses, onCourse }) {
  const palette = useLibraryPalette();
  if (courses.length === 0) return null;
  return (
    <Box component="section" aria-label="Continue learning" sx={panelSx(palette)}>
      <Typography component="h2" sx={{ ...libSectionTitleSx, mb: 1.5 }}>Continue learning</Typography>
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {courses.map((course) => <CourseCard key={course.slug} course={course} onOpen={onCourse} palette={palette} />)}
      </Box>
    </Box>
  );
}
