import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails,
  Chip, Button, LinearProgress, CircularProgress, Stack, Link as MuiLink,
  FormControlLabel, Checkbox,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ProgressRing from '../../components/ProgressRing';
import { prepApi } from '../../api/prepApi';

const WEAKNESS_COLOR = { weak: 'error', moderate: 'warning', strong: 'success' };
const WEAKNESS_LABEL = { weak: 'Weak area', moderate: 'Needs work', strong: 'Strong' };

export default function PrepRoadmapPage() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const load = () => {
    prepApi.getRoadmap(companySlug).then(({ data }) => setRoadmap(data.data));
  };

  useEffect(() => {
    setLoading(true);
    prepApi
      .getRoadmap(companySlug)
      .then(({ data }) => setRoadmap(data.data))
      .finally(() => setLoading(false));
  }, [companySlug]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await prepApi.enroll(companySlug);
      load();
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!roadmap) return null;

  const goToLearn = (section) => {
    if (section.contentType === 'learn-topic' && section.learnTopicSlug) navigate(`/learn/${section.learnTopicSlug}`);
    else if (section.contentType === 'aptitude-pattern') navigate(section.aptitudePatternSlug ? `/aptitude/${section.aptitudePatternSlug}` : '/aptitude');
  };

  const goToPractice = (section) => {
    if (section.contentType === 'aptitude-pattern') {
      navigate(section.aptitudePatternSlug ? `/aptitude/${section.aptitudePatternSlug}/practice` : '/aptitude');
      return;
    }
    if (section.contentType !== 'problem-filter') return;

    const params = new URLSearchParams();
    (section.problemFilter?.companies || []).forEach((c) => params.append('company', c));
    if (section.problemFilter?.difficulty) params.set('difficulty', section.problemFilter.difficulty);
    navigate(params.toString() ? `/problems?${params.toString()}` : '/problems');
  };

  const handleSelfReportToggle = async (section, checked) => {
    await prepApi.updateProgress(companySlug, section.id, { selfReported: checked });
    load();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
        {roadmap.readiness !== null && <ProgressRing value={roadmap.readiness} max={100} label="Ready" color="#3B82F6" size={90} strokeWidth={8} />}
        <Box sx={{ flexGrow: 1, minWidth: 200 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{roadmap.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{roadmap.description}</Typography>
          {roadmap.examDurationMinutes && (
            <Chip icon={<AccessTimeRoundedIcon sx={{ fontSize: '0.9rem !important' }} />} label={`${roadmap.examDurationMinutes} min exam`} size="small" variant="outlined" />
          )}
        </Box>
        {!roadmap.enrolled && (
          <Button variant="contained" disableElevation disabled={enrolling} onClick={handleEnroll} sx={{ fontWeight: 700 }}>
            {enrolling ? 'Enrolling…' : 'Start prepping'}
          </Button>
        )}
      </Paper>

      <Stack spacing={1.5}>
        {roadmap.sections.map((section) => (
          <Accordion key={section.id} variant="outlined" sx={{ '&:before': { display: 'none' }, borderRadius: '12px !important', overflow: 'hidden' }}>
            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', pr: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{section.name}</Typography>
                  {section.trackable && (
                    <LinearProgress
                      variant="determinate"
                      value={section.progressPercent}
                      sx={{ height: 5, borderRadius: 3, mt: 0.5, maxWidth: 200, bgcolor: 'action.disabledBackground' }}
                    />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">{section.weight}%</Typography>
                {section.selfReported && (
                  <Chip label="Self-reported" size="small" variant="outlined" sx={{ fontWeight: 600, borderStyle: 'dashed' }} />
                )}
                {section.weakness && !section.selfReported && (
                  <Chip label={WEAKNESS_LABEL[section.weakness]} size="small" color={WEAKNESS_COLOR[section.weakness]} variant="outlined" sx={{ fontWeight: 600 }} />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{section.description}</Typography>

              {section.trackable && !section.selfReported && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  {section.practiceCount} / {section.target} practiced
                </Typography>
              )}

              {section.contentType === 'external-only' && (
                <FormControlLabel
                  sx={{ mb: 1, display: 'flex' }}
                  control={
                    <Checkbox
                      checked={Boolean(section.selfReported)}
                      onChange={(e) => handleSelfReportToggle(section, e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I've reviewed this section
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Self-reported — we can't measure activity on external sites, so this is an honesty checkbox, not a verified score.
                      </Typography>
                    </Typography>
                  }
                />
              )}

              <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', mb: section.externalResources?.length ? 2 : 0 }}>
                {(section.contentType === 'learn-topic' || section.contentType === 'aptitude-pattern') && (
                  <Button size="small" variant="outlined" onClick={() => goToLearn(section)} sx={{ fontWeight: 600 }}>Learn</Button>
                )}
                {(section.contentType === 'problem-filter' || section.contentType === 'aptitude-pattern') && (
                  <Button size="small" variant="contained" disableElevation onClick={() => goToPractice(section)} sx={{ fontWeight: 600 }}>Practice</Button>
                )}
              </Stack>

              {section.externalResources?.length > 0 && (
                <Stack spacing={0.5}>
                  {section.externalResources.map((r) => (
                    <MuiLink key={r.url} href={r.url} target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem', fontWeight: 600 }}>
                      {r.label} <OpenInNewRoundedIcon sx={{ fontSize: '0.9rem' }} />
                    </MuiLink>
                  ))}
                </Stack>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Container>
  );
}
