import { Box, Typography } from '@mui/material';
import { useLibraryPalette } from '../../../dashboard/components/libraryStyle';
import { BORDER_WIDTHS, FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../../app/design/designTokens';
import PredictExercise from './PredictExercise';
import TaskExercise from './TaskExercise';

const EXERCISE_VIEWS = { predict: PredictExercise, task: TaskExercise };

function ExerciseCard({ exercise, number }) {
  const palette = useLibraryPalette();
  const ExerciseView = EXERCISE_VIEWS[exercise.kind];
  return (
    <Box component="section" aria-label={`Exercise ${number}`} sx={{ p: 2, borderRadius: RADII_PX.card, bgcolor: palette.chip, border: `${BORDER_WIDTHS.thin}px solid ${palette.border}` }}>
      <Typography sx={{ mb: 1, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.semibold, color: palette.muted }}>Exercise {number}</Typography>
      <ExerciseView exercise={exercise} />
    </Box>
  );
}

// Practice for the open lesson. Each exercise keeps its own answers while the lesson is open and starts fresh in the
// next lesson, because the card key includes the lesson.
export default function ExercisesPanel({ lessonKey, exercises }) {
  return (
    <Box component="aside" aria-label="Exercises" sx={{ display: 'grid', gap: 2 }}>
      <Typography component="h2" sx={{ fontSize: FONT_SIZES.heading, fontWeight: FONT_WEIGHTS.bold }}>Exercises</Typography>
      {exercises.map((exercise, index) => <ExerciseCard key={`${lessonKey}:${exercise.id}`} exercise={exercise} number={index + 1} />)}
    </Box>
  );
}
