import { useMemo, useState } from 'react';
import { useParams, Navigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { getTopicBySlug } from './content/topics';
import { ANIMATION_REGISTRY } from './animations/registry';

// Accepts a normal watch URL, a youtu.be short link, or an already-embed
// URL, and returns an embeddable src — or null if it can't be parsed
// (renders no side panel rather than a broken iframe).
function toYoutubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.pathname.startsWith('/embed/')) return url;
    let id = '';
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1);
    else if (u.searchParams.get('v')) id = u.searchParams.get('v');
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

function PracticeQuiz({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(
    () => questions.filter((q) => answers[q.id] === q.correctIndex).length,
    [answers, questions]
  );

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        Practice
      </Typography>
      <Stack spacing={3}>
        {questions.map((q, qi) => {
          const selected = answers[q.id];
          const isCorrect = selected === q.correctIndex;
          return (
            <Box key={q.id}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                {qi + 1}. {q.question}
              </Typography>
              <RadioGroup
                value={selected ?? ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: Number(e.target.value) }))}
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
            </Box>
          );
        })}
      </Stack>

      <Divider sx={{ my: 3 }} />

      {submitted ? (
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography sx={{ fontWeight: 700 }}>
            Score: {score} / {questions.length}
          </Typography>
          <Button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
            }}
          >
            Retry
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
          Check answers
        </Button>
      )}
    </Paper>
  );
}

export default function LearnTopicPage() {
  const { topicSlug } = useParams();
  const topic = getTopicBySlug(topicSlug);

  // Flatten sections into a single ordered list of subsections for easy
  // "current item" tracking, while keeping section headers for the nav.
  const flatSubsections = useMemo(
    () => (topic ? topic.sections.flatMap((sec) => sec.subsections.map((sub) => ({ ...sub, sectionTitle: sec.title }))) : []),
    [topic]
  );

  const [activeId, setActiveId] = useState(flatSubsections[0]?.id);
  const active = flatSubsections.find((s) => s.id === activeId) || flatSubsections[0];

  if (!topic) return <Navigate to="/learn" replace />;

  const AnimationComponent = active?.animationKey ? ANIMATION_REGISTRY[active.animationKey] : null;
  const embedUrl = toYoutubeEmbedUrl(active?.videoUrl);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        {topic.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {topic.tagline}
      </Typography>

      <Grid container spacing={3}>
        {/* --- Left: section/subsection nav --- */}
        <Grid item xs={12} md={3}>
          <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', position: { md: 'sticky' }, top: { md: 16 } }}>
            {topic.sections.map((sec) => (
              <Box key={sec.id}>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', fontWeight: 700, px: 2, pt: 2, pb: 0.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  {sec.title}
                </Typography>
                <List dense disablePadding>
                  {sec.subsections.map((sub) => (
                    <ListItemButton
                      key={sub.id}
                      selected={sub.id === activeId}
                      onClick={() => setActiveId(sub.id)}
                      sx={{ py: 0.75 }}
                    >
                      <ListItemText
                        primary={sub.title}
                        primaryTypographyProps={{ fontSize: 13.5, fontWeight: sub.id === activeId ? 700 : 500 }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* --- Center: content + optional side video --- */}
        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={embedUrl ? 8 : 12}>
              <Stack spacing={2}>
                <Chip label={active.sectionTitle} size="small" sx={{ alignSelf: 'flex-start', fontWeight: 600 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {active.title}
                </Typography>

                {AnimationComponent && <AnimationComponent />}

                <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
                  <Stack spacing={1.5}>
                    {active.explanation.map((para, i) => (
                      <Typography key={i} variant="body2" color="text.secondary">
                        {para}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              </Stack>
            </Grid>

            {embedUrl && (
              <Grid item xs={12} lg={4}>
                <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', position: { lg: 'sticky' }, top: { lg: 16 } }}>
                  <Box sx={{ position: 'relative', pt: '56.25%' }}>
                    <Box
                      component="iframe"
                      src={embedUrl}
                      title={active.title}
                      allowFullScreen
                      sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                    />
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 4 }} />

          <PracticeQuiz questions={topic.practiceQuestions} />

          {topic.practiceBank && (
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: { xs: 2.5, sm: 3 },
                borderRadius: 3,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Ready for full practice?
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  40 questions across 3 difficulty levels — Basics, Moderate, Advanced.
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to={`/learn/${topic.slug}/practice`}
                variant="contained"
                disableElevation
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ fontWeight: 700, bgcolor: 'background.paper', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
              >
                Start Practice
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
