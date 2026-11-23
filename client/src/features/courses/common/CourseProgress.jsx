import { Box, Typography } from '@mui/material';
import { tint } from '../../dashboard/dashboardUtils';
import { LIB_ACCENT } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, RADII_PX, SIZES } from '../../../app/design/designTokens';

const TRACK_TINT_PERCENT = 20;

// "3/12 lessons" with a thin bar, for courses the learner owns. Shared by the Courses page and the Store.
export default function CourseProgress({ progress, name }) {
  return (
    <Box>
      <Typography sx={{ fontSize: FONT_SIZES.body, fontVariantNumeric: 'tabular-nums' }}>{progress.doneCount}/{progress.lessonCount} lessons</Typography>
      <Box role="progressbar" aria-label={`${name} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent} sx={{ mt: 0.5, height: SIZES.progressBarHeight, borderRadius: RADII_PX.pill, bgcolor: tint(LIB_ACCENT, TRACK_TINT_PERCENT), overflow: 'hidden' }}>
        <Box sx={{ width: `${progress.percent}%`, height: SIZES.fill, borderRadius: RADII_PX.pill, bgcolor: LIB_ACCENT }} />
      </Box>
    </Box>
  );
}
