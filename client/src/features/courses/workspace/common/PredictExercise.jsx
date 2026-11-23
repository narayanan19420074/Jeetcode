import { useState } from 'react';
import { Alert, Button, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../../app/design/designTokens';
import CodeBlock from './CodeBlock';

const optionSx = { '& .MuiFormControlLabel-label': { fontSize: FONT_SIZES.body } };

function AnswerFeedback({ isCorrect, explanation }) {
  return (
    <Alert severity={isCorrect ? 'success' : 'error'} sx={{ mt: 2 }}>
      <strong>{isCorrect ? 'Correct. ' : 'Not quite. '}</strong>
      {isCorrect ? explanation : 'Read the code again and try another option.'}
    </Alert>
  );
}

// Multiple-choice exercise. The explanation appears only after a correct answer, so a wrong guess is followed by another try.
export default function PredictExercise({ exercise }) {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const choose = (event) => {
    setSelected(Number(event.target.value));
    setChecked(false);
  };
  return (
    <>
      <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium }}>{exercise.prompt}</Typography>
      {exercise.snippet && <CodeBlock value={exercise.snippet} />}
      <FormControl>
        <RadioGroup value={selected ?? ''} onChange={choose} aria-label={exercise.prompt}>
          {exercise.options.map((option, index) => <FormControlLabel key={option} value={index} control={<Radio size="small" />} label={option} sx={optionSx} />)}
        </RadioGroup>
      </FormControl>
      <Button onClick={() => setChecked(true)} disabled={selected === null} variant="contained" size="small" sx={{ mt: 1, display: 'block', borderRadius: RADII_PX.pill, textTransform: 'none' }}>Check answer</Button>
      {checked && <AnswerFeedback isCorrect={selected === exercise.answer} explanation={exercise.explanation} />}
    </>
  );
}
