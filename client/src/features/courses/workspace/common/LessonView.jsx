import { Box, Typography } from '@mui/material';
import { useLibraryPalette } from '../../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, TEXT_MEASURE } from '../../../../app/design/designTokens';
import { levelLabel } from '../../content/courseLevels';
import { pluralize } from '../../common/courseSelectors';
import LessonBlocks from './LessonBlocks';
import LessonNavigation from './LessonNavigation';

// Main area of the learning page: where the lesson sits in the course, its title and length, the text and examples,
// then the buttons to move on.
export default function LessonView({ workspace }) {
  const palette = useLibraryPalette();
  const { lesson, module } = workspace.current;
  return (
    <Box component="article" aria-label={lesson.title} sx={{ maxWidth: TEXT_MEASURE.legal }}>
      <Typography sx={{ fontSize: FONT_SIZES.body, color: palette.muted }}>{levelLabel(module.level)} · {module.title}</Typography>
      <Typography component="h1" sx={{ mt: 0.5, fontSize: { xs: FONT_SIZES.displayLg, md: FONT_SIZES.hero }, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.2 }}>{lesson.title}</Typography>
      <Typography sx={{ mt: 1, fontSize: FONT_SIZES.body, color: palette.muted }}>{lesson.minutes} min · {pluralize(lesson.exercises.length, 'exercise')}</Typography>
      <LessonBlocks blocks={lesson.blocks} />
      <LessonNavigation workspace={workspace} />
    </Box>
  );
}
