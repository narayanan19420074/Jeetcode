import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { selectOption, checkAnswer } from './aptitudeSlice';

export default function AptitudePracticePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { attemptId, questions, selectedOptions, checkResults } = useSelector((s) => s.aptitude);

  const [currentIdx, setCurrentIdx] = useState(0);

  if (!attemptId || questions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const question = questions[currentIdx];
  const result = checkResults[question._id];
  const selected = selectedOptions[question._id];

  const handleCheck = () => {
    if (selected === undefined) return;
    dispatch(checkAnswer({ attemptId, questionId: question._id, selectedOption: selected }));
  };

  const handleFinish = () => navigate(`/aptitude/${slug}`);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Practice — Question {currentIdx + 1} / {questions.length}
      </Typography>

      <LinearProgress
        variant="determinate"
        value={((currentIdx + 1) / questions.length) * 100}
        sx={{ height: 6, borderRadius: 3, mb: 3 }}
      />

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
          {question.questionText}
        </Typography>

        <RadioGroup
          value={selected ?? ''}
          onChange={(e) => dispatch(selectOption({ questionId: question._id, optionIndex: Number(e.target.value) }))}
        >
          {question.options.map((opt, idx) => {
            const isCorrectOpt = result && idx === result.correctOptionIndex;
            const isWrongPick = result && idx === selected && !result.isCorrect;
            return (
              <FormControlLabel
                key={idx}
                value={idx}
                control={<Radio disabled={!!result} />}
                label={opt.text}
                sx={{
                  py: 0.5,
                  borderRadius: 1,
                  ...(isCorrectOpt && { bgcolor: 'success.main', color: 'success.contrastText', opacity: 0.15 }),
                  ...(isWrongPick && { bgcolor: 'error.main', color: 'error.contrastText', opacity: 0.15 }),
                }}
              />
            );
          })}
        </RadioGroup>

        {result && (
          <Alert
            icon={result.isCorrect ? <CheckCircleRoundedIcon fontSize="inherit" /> : <CancelRoundedIcon fontSize="inherit" />}
            severity={result.isCorrect ? 'success' : 'error'}
            sx={{ mt: 2 }}
          >
            {result.isCorrect ? 'Correct!' : 'Not quite.'} {result.explanation}
          </Alert>
        )}
      </Paper>

      <Stack direction="row" spacing={1.5} justifyContent="space-between">
        <Button disabled={currentIdx === 0} onClick={() => setCurrentIdx((i) => i - 1)}>
          Previous
        </Button>

        {!result ? (
          <Button variant="contained" onClick={handleCheck} disabled={selected === undefined}>
            Check Answer
          </Button>
        ) : currentIdx < questions.length - 1 ? (
          <Button variant="contained" onClick={() => setCurrentIdx((i) => i + 1)}>
            Next
          </Button>
        ) : (
          <Button variant="contained" color="success" onClick={handleFinish}>
            Finish
          </Button>
        )}
      </Stack>
    </Container>
  );
}
