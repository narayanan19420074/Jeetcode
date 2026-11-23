import { useState } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../../app/design/designTokens';
import CodeBlock from './CodeBlock';

const revealButtonSx = { borderRadius: RADII_PX.pill, textTransform: 'none' };

// Write-it-yourself exercise. The hint and the reference solution stay closed until asked for, because trying first is
// what makes the practice work.
export default function TaskExercise({ exercise }) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  return (
    <>
      <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium }}>{exercise.prompt}</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
        <Button onClick={() => setShowHint((open) => !open)} aria-expanded={showHint} variant="outlined" size="small" sx={revealButtonSx}>{showHint ? 'Hide hint' : 'Show hint'}</Button>
        <Button onClick={() => setShowSolution((open) => !open)} aria-expanded={showSolution} variant="outlined" size="small" sx={revealButtonSx}>{showSolution ? 'Hide solution' : 'Show solution'}</Button>
      </Box>
      {showHint && <Alert severity="info" sx={{ mt: 2 }}>{exercise.hint}</Alert>}
      {showSolution && <CodeBlock value={exercise.solution} />}
    </>
  );
}
