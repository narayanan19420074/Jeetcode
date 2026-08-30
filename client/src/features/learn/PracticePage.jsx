import { useState, useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import { getTopicBySlug } from './content/topics';

const LEVELS = [
  { key: 'level1', label: 'Level 1', sub: 'Basics' },
  { key: 'level2', label: 'Level 2', sub: 'Moderate' },
  { key: 'level3', label: 'Level 3', sub: 'Advanced' },
];

export default function PracticePage() {
  const { topicSlug } = useParams();
  const navigate = useNavigate();
  const topic = getTopicBySlug(topicSlug);

  const [levelIdx, setLevelIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!topic) return <Navigate to="/learn" replace />;

  if (!topic.practiceBank) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto', px: 2, py: 8, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Full practice bank coming soon
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {topic.title} doesn't have leveled practice questions yet — check back soon, or try the quick concept-check
          on the topic page for now.
        </Typography>
        <Button variant="outlined" onClick={() => navigate(`/learn/${topicSlug}`)} sx={{ fontWeight: 600 }}>
          Back to {topic.title}
        </Button>
      </Box>
    );
  }

  const level = LEVELS[levelIdx];
  const questions = topic.practiceBank[level.key] || [];
  const score = useMemo(
    () => questions.filter((q) => answers[q.id] === q.correctIndex).length,
    [answers, questions]
  );

  const handleLevelChange = (_, idx) => {
    setLevelIdx(idx);
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', px: 2, py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        {topic.title} — Practice
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Pick a difficulty level and work through the set — {questions.length} questions in this level.
      </Typography>

      <Tabs value={levelIdx} onChange={handleLevelChange} sx={{ mb: 3 }}>
        {LEVELS.map((l) => (
          <Tab key={l.key} label={`${l.label} · ${l.sub}`} />
        ))}
      </Tabs>

      <Stack spacing={2.5}>
        {questions.map((q, qi) => {
          const selected = answers[q.id];
          const isCorrect = selected === q.correctIndex;
          return (
            <Paper key={q.id} elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                {qi + 1}. {q.question}
              </Typography>
              <RadioGroup
                value={selected ?? ''}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: Number(e.target.value) }))
                }
              >
                {q.options.map((opt, oi) => (
                  <FormControlLabel
                    key={oi}
                    value={oi}
                    control={<Radio size="small" />}
                    label={opt}
                    disabled={submitted}
                  />
                ))}
              </RadioGroup>
              {submitted && selected !== undefined && (
                <Alert severity={isCorrect ? 'success' : 'error'} sx={{ mt: 1 }}>
                  {isCorrect ? 'Correct — ' : 'Not quite — '}
                  {q.explanation}
                </Alert>
              )}
            </Paper>
          );
        })}
      </Stack>

      <Divider sx={{ my: 3 }} />

      {submitted ? (
        <Stack direction="row" alignItems="center" spacing={2}>
          <Chip
            label={`Score: ${score} / ${questions.length}`}
            color={questions.length && score / questions.length >= 0.6 ? 'success' : 'default'}
            sx={{ fontWeight: 700 }}
          />
          <Button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
            }}
          >
            Retry this level
          </Button>
        </Stack>
      ) : (
        <Button
          variant="contained"
          disableElevation
          disabled={Object.keys(answers).length < questions.length}
          onClick={() => setSubmitted(true)}
          sx={{ fontWeight: 700 }}
        >
          Submit {level.label}
        </Button>
      )}
    </Box>
  );
}
