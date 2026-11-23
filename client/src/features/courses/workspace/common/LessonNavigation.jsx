import { Box, Button } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { BORDER_WIDTHS, FONT_WEIGHTS, RADII_PX } from '../../../../app/design/designTokens';
import { useLibraryPalette } from '../../../dashboard/components/libraryStyle';

const buttonSx = { borderRadius: RADII_PX.pill, textTransform: 'none', fontWeight: FONT_WEIGHTS.semibold };

function CompletionButton({ isDone, onToggle, onContinue, hasNext }) {
  if (isDone) return <Button onClick={onToggle} variant="outlined" color="success" startIcon={<CheckCircleRoundedIcon />} sx={buttonSx}>Completed</Button>;
  return <Button onClick={hasNext ? onContinue : onToggle} variant="contained" sx={buttonSx}>{hasNext ? 'Complete and continue' : 'Complete course'}</Button>;
}

// End of a lesson: previous lesson, the completion button and next lesson. Completing a lesson is the learner's own call,
// so lessons are never ticked off automatically.
export default function LessonNavigation({ workspace }) {
  const { previous, next, current, doneSet, selectLesson, toggleDone, completeAndContinue } = workspace;
  const palette = useLibraryPalette();
  return (
    <Box component="nav" aria-label="Lesson navigation" sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mt: 5, pt: 3, borderTop: `${BORDER_WIDTHS.thin}px solid ${palette.border}` }}>
      <Button disabled={!previous} onClick={() => selectLesson(previous.key)} startIcon={<ArrowBackRoundedIcon />} sx={buttonSx}>Previous</Button>
      <CompletionButton isDone={doneSet.has(current.key)} onToggle={toggleDone} onContinue={completeAndContinue} hasNext={Boolean(next)} />
      <Button disabled={!next} onClick={() => selectLesson(next.key)} endIcon={<ArrowForwardRoundedIcon />} sx={buttonSx}>Next</Button>
    </Box>
  );
}
