import { Box, ButtonBase, Typography } from '@mui/material';
import { tint } from '../../dashboard/dashboardUtils';
import { LIB_ACCENT, LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { Coins } from '../../store/storeUtils';
import CourseProgress from './CourseProgress';
import { FONT_SIZES, FONT_WEIGHTS, MOTION, RADII_PX } from '../../../app/design/designTokens';
import CourseCover from './CourseCover';
import { formatDuration, pluralize } from './courseSelectors';

const TWO_LINES = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' };
const BADGE_TINT_PERCENT = 20;

function LevelBadge({ level, palette }) {
  return <Typography component="span" sx={{ px: 1, py: 0.25, borderRadius: RADII_PX.badge, bgcolor: tint(LIB_ACCENT, BADGE_TINT_PERCENT), color: palette.text, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.medium }}>{level}</Typography>;
}

// Learners who own or have started the course see their progress; free courses say so; the rest show the price in coins.
function CourseFooter({ course }) {
  if (course.owned && course.progress) return <CourseProgress progress={course.progress} name={course.name} />;
  if (course.price === 0) return <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium }}>Free</Typography>;
  return <Coins value={course.price} size={20} />;
}

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
