import { useMemo, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
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
} from '@mui/material';
import { getTopicBySlug } from './content/topics';
import { ANIMATION_REGISTRY } from './animations/registry';
import { completeLearn } from '../aptitude/aptitudeSlice';

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

// NOTE: PracticeQuiz (inline quick-check) and the "Ready for full
// practice?" practiceBank CTA have been removed on purpose — Practice and
// Test now live one level up, on AptitudePatternDetailPage's 3-card flow,
// gated behind the "Mark as Learned" button below.

export default function LearnTopicPage() {
  const { topicSlug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
  const isLastSubsection = flatSubsections[flatSubsections.length - 1]?.id === activeId;

  const handleMarkLearned = async () => {
    await dispatch(completeLearn(topicSlug));
    navigate(`/aptitude/${topicSlug}`);
  };

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

          {/* Only shows on the last subsection — reading every subsection
              is the gate for unlocking Practice/Test on the pattern page. */}
          {isLastSubsection && (
            <>
              <Divider sx={{ my: 4 }} />
              <Button
                variant="contained"
                disableElevation
                fullWidth
                onClick={handleMarkLearned}
                sx={{ fontWeight: 700, py: 1.5 }}
              >
                Mark as Learned — go to Practice &amp; Test
              </Button>
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
