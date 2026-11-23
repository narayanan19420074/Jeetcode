import { Box, ButtonBase, Typography } from '@mui/material';
import { tint } from '../../dashboard/dashboardUtils';
import { LIB_ACCENT, LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { Coins } from '../../store/storeUtils';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, MOTION, RADII_PX, SIZES } from '../../../app/design/designTokens';
import CourseCover from './CourseCover';
import { formatDuration, pluralize } from './courseSelectors';

const TWO_LINES = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };
const BAR_TINT_PERCENT = 20;

function LevelBadge({ level, palette }) {
  return <Typography component="span" sx={{ px: 1, py: 0.25, borderRadius: RADII_PX.badge, bgcolor: tint(LIB_ACCENT, BAR_TINT_PERCENT), color: palette.text, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.medium }}>{level}</Typography>;
}

function ProgressLine({ progress, name }) {
  return (
    <Box>
      <Typography sx={{ fontSize: FONT_SIZES.body, fontVariantNumeric: 'tabular-nums' }}>{progress.doneCount}/{progress.lessonCount} lessons</Typography>
      <Box role="progressbar" aria-label={`${name} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent} sx={{ mt: 0.5, height: SIZES.progressBarHeight, borderRadius: RADII_PX.pill, bgcolor: tint(LIB_ACCENT, BAR_TINT_PERCENT), overflow: 'hidden' }}>
        <Box sx={{ width: `${progress.percent}%`, height: SIZES.fill, borderRadius: RADII_PX.pill, bgcolor: LIB_ACCENT }} />
      </Box>
    </Box>
  );
}

// Learners who own the course see their progress; everyone else sees the price in coins.
const CourseFooter = ({ course }) => (course.owned && course.progress ? <ProgressLine progress={course.progress} name={course.name} /> : <Coins value={course.price} size={20} />);

// One course in the Courses list: cover, title, one-line summary, length and level, then progress or price.
export default function CourseCard({ course, onOpen }) {
  const palette = useLibraryPalette();
  return (
    <ButtonBase onClick={() => onOpen(course.slug)} aria-label={`Open ${course.name}`} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', textAlign: 'left', fontFamily: 'inherit', color: palette.text, borderRadius: RADII_PX.card, overflow: 'hidden', bgcolor: palette.chip, border: `1px solid ${palette.border}`, transition: `border-color ${MOTION.fast}ms`, '&:hover': { borderColor: LIB_ACCENT } }}>
      <CourseCover accent={course.accent} heading={course.name} image={course.image} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, flex: 1 }}>
        <Typography component="h3" sx={[{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, lineHeight: 1.4, letterSpacing: LIB_TRACKING }, TWO_LINES]}>{course.name}</Typography>
        <Typography sx={[{ fontSize: FONT_SIZES.body, color: palette.muted }, TWO_LINES]}>{course.blurb}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: FONT_SIZES.body, color: palette.muted }}>
          <span>{formatDuration(course.minutes)}</span>
          <span aria-hidden>·</span>
          <span>{pluralize(course.lessonCount, 'lesson')}</span>
          <LevelBadge level={course.level} palette={palette} />
        </Box>
        <Box sx={{ mt: 'auto', pt: 1 }}><CourseFooter course={course} /></Box>
      </Box>
    </ButtonBase>
  );
}
