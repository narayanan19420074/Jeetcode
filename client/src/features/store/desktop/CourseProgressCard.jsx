import { Box, ButtonBase, Typography } from '@mui/material';
import CourseProgress from '../../courses/common/CourseProgress';
import { useLibraryCardSx } from '../../dashboard/components/libraryCardStyles';
import { LIB_TRACKING, libSectionTitleSx } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

function CourseRow({ course, onOpen }) {
  return (
    <ButtonBase onClick={() => onOpen(course.slug)} sx={{ display: 'block', width: SIZES.fill, p: 1, textAlign: 'left', fontFamily: 'inherit', color: 'inherit', borderRadius: RADII_PX.card }}>
      <Typography noWrap sx={{ mb: 0.5, fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, letterSpacing: LIB_TRACKING }}>{course.name}</Typography>
      <CourseProgress progress={course.progress} name={course.name} />
    </ButtonBase>
  );
}

// Courses the learner already owns, so they can resume from the Store.
export default function CourseProgressCard({ courses, onOpen }) {
  const cardSx = useLibraryCardSx();
  if (courses.length === 0) return null;
  return (
    <Box component="section" aria-label="Continue learning" sx={{ ...cardSx, gap: 1 }}>
      <Typography component="h2" sx={libSectionTitleSx}>Continue learning</Typography>
      {courses.map((course) => <CourseRow key={course.slug} course={course} onOpen={onOpen} />)}
    </Box>
  );
}
