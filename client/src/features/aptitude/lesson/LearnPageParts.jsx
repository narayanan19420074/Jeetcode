import { Box, IconButton, LinearProgress, Paper, Stack, Typography, alpha } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CircleIcon from '@mui/icons-material/Circle';
import { BORDER_WIDTHS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

export const LEARN_PAGE_MAX = 1280;
const PROGRESS_MIN_WIDTH = { xs: '7rem', sm: '14rem' };

const dotColor = (isActive) => (isActive ? 'primary.main' : 'text.disabled');

export function LearnTopBar({ title, lessonIndex, lessonTotal, lessonTitle, doneCount, onBack }) {
  return (
    <Box sx={{ position: 'sticky', top: 0, zIndex: (theme) => theme.zIndex.appBar - 1, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', maxWidth: LEARN_PAGE_MAX, mx: 'auto', px: 2, py: 1.5 }}>
        <IconButton size="small" onClick={onBack} aria-label="Back to pattern"><ArrowBackRoundedIcon fontSize="small" /></IconButton>
        <Box sx={{ minWidth: SIZES.flexShrinkMinWidth }}>
          <Typography variant="subtitle2" sx={{ fontWeight: FONT_WEIGHTS.bold }} noWrap>{title || 'Learn'}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>Lesson {lessonIndex + 1} of {lessonTotal} · {lessonTitle}</Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: PROGRESS_MIN_WIDTH }}>
          <LinearProgress variant="determinate" value={(doneCount / lessonTotal) * 100} sx={{ flexGrow: 1, height: SIZES.progressBarHeight, borderRadius: RADII_PX.pill }} />
          <Typography variant="caption" sx={{ fontFamily: FONTS.mono, fontWeight: FONT_WEIGHTS.bold, color: 'text.secondary' }}>{doneCount}/{lessonTotal}</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

function LessonRowContent({ lesson, number, isActive, isDone }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
      {isDone ? <CheckRoundedIcon sx={{ fontSize: FONT_SIZES.title, color: 'success.main' }} /> : <CircleIcon sx={{ fontSize: FONT_SIZES.dot, mx: 0.5, color: dotColor(isActive) }} />}
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography variant="body2" sx={{ fontSize: FONT_SIZES.body, fontWeight: isActive ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium, lineHeight: 1.3, color: isActive ? 'text.primary' : 'text.secondary' }}>{number}. {lesson.title}</Typography>
        <Typography variant="caption" color="text.disabled">{lesson.minutes} min</Typography>
      </Box>
    </Stack>
  );
}

export function LessonList({ lessons, activeId, completed, onSelect }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: RADII_PX.card, overflow: 'hidden', position: 'sticky', top: SIZES.desktopFrame.stickyTop }}>
      <Typography variant="overline" sx={{ display: 'block', px: 2, pt: 2, pb: 0.5, fontWeight: FONT_WEIGHTS.bold, color: 'text.secondary', letterSpacing: '0.08em', fontSize: FONT_SIZES.micro }}>Lessons</Typography>
      <Stack sx={{ pb: 1 }}>
        {lessons.map((lesson, position) => {
          const isActive = lesson.id === activeId;
          return (
            <Box key={lesson.id} onClick={() => onSelect(lesson.id)} sx={{ position: 'relative', cursor: 'pointer', px: 2, py: 1, bgcolor: isActive ? (theme) => alpha(theme.palette.primary.main, 0.07) : 'transparent', '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) } }}>
              {isActive && <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: BORDER_WIDTHS.accent, bgcolor: 'primary.main' }} />}
              <LessonRowContent lesson={lesson} number={position + 1} isActive={isActive} isDone={completed.has(lesson.id)} />
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}

// Phone only: one bar per lesson, tap a bar to jump to that lesson.
export function LessonPager({ lessons, activeIndex, completed, onSelect }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ display: { xs: 'flex', md: 'none' }, mb: 2 }}>
      {lessons.map((lesson, position) => (
        <Box key={lesson.id} onClick={() => onSelect(lesson.id)} sx={{ flex: 1, height: SIZES.progressBarHeight, borderRadius: RADII_PX.pill, cursor: 'pointer', bgcolor: position === activeIndex ? 'primary.main' : completed.has(lesson.id) ? 'success.main' : 'action.disabledBackground' }} />
      ))}
    </Stack>
  );
}
