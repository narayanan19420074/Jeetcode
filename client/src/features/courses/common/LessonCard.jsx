import { Box, ButtonBase, Typography } from '@mui/material';
import { LIB_ACCENT, LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, MOTION, RADII_PX } from '../../../app/design/designTokens';
import CourseCover from './CourseCover';
import { formatDuration } from './courseSelectors';

const KIND_LABEL = { practice: 'Practice', read: 'Read', visual: 'Visual' };

// One lesson in the Lessons list. Opening it shows the course it belongs to, where owners can start it.
export default function LessonCard({ lesson, onOpen }) {
  const palette = useLibraryPalette();
  const status = lesson.done ? 'Completed' : formatDuration(lesson.minutes);
  return (
    <ButtonBase onClick={() => onOpen(lesson.courseSlug)} aria-label={`${lesson.title}, ${lesson.courseName}`} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', textAlign: 'left', fontFamily: 'inherit', color: palette.text, borderRadius: RADII_PX.card, overflow: 'hidden', bgcolor: palette.chip, border: `1px solid ${palette.border}`, transition: `border-color ${MOTION.fast}ms`, '&:hover': { borderColor: LIB_ACCENT } }}>
      <CourseCover accent={lesson.accent} heading={KIND_LABEL[lesson.kind] ?? 'Lesson'} subheading={lesson.moduleTitle} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 2 }}>
        <Typography component="h3" sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, lineHeight: 1.4, letterSpacing: LIB_TRACKING }}>{lesson.title}</Typography>
        <Typography sx={{ fontSize: FONT_SIZES.body, color: palette.muted }}>{lesson.courseName} · {status}</Typography>
      </Box>
    </ButtonBase>
  );
}
