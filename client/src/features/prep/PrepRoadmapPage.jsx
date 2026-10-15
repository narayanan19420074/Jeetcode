import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails,
  Chip, Button, ButtonBase, LinearProgress, CircularProgress, Stack, Tooltip, Link as MuiLink,
  FormControlLabel, Checkbox,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ProgressRing from '../../components/ProgressRing';
import CompanyAvatar from '../../components/CompanyAvatar';
import DifficultyChip from '../../components/DifficultyChip';
import { prepApi } from '../../api/prepApi';
import { examCountdown, formatExamDate } from './examDate';

const WEAKNESS_COLOR = { weak: 'error', moderate: 'warning', strong: 'success' };
const WEAKNESS_LABEL = { weak: 'Weak area', moderate: 'Needs work', strong: 'Strong' };
const PROBLEMS_SHOWN = 15;

// One aptitude pattern inside a section: progress + Learn / Practice (or a lock).
function PatternRow({ pattern, hard, navigate }) {
  const pct = pattern.total ? Math.round((pattern.solved / pattern.total) * 100) : 0;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap' }}>
      <Box sx={{ flex: '1 1 170px', minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{pattern.title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress variant="determinate" value={pct} sx={{ flex: 1, maxWidth: 140, height: 4, borderRadius: 2, bgcolor: 'action.disabledBackground' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {pattern.solved}/{pattern.total}
          </Typography>
        </Box>
      </Box>
      {pattern.unlocked ? (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => navigate(`/aptitude/${pattern.slug}/learn`)} sx={{ fontWeight: 600 }}>
            Learn
          </Button>
          <Button size="small" variant="contained" disableElevation onClick={() => navigate(`/aptitude/${pattern.slug}/practice${hard ? '?difficulty=hard' : ''}`)} sx={{ fontWeight: 600 }}>
            Practice
          </Button>
        </Stack>
      ) : (
        <Tooltip title="Pass the previous aptitude pattern's test to unlock this one" enterTouchDelay={0}>
          <Chip icon={<LockRoundedIcon />} label="Locked" size="small" variant="outlined" />
        </Tooltip>
      )}
    </Box>
  );
}

// The sheet's coding problems, each opens in the editor.
function ProblemList({ problems, total, navigate }) {
  const [all, setAll] = useState(false);
  const shown = all ? problems : problems.slice(0, PROBLEMS_SHOWN);
  return (
    <Box sx={{ mb: 1 }}>
      {shown.map((p) => (
        <ButtonBase
          key={p.slug}
          onClick={() => navigate(`/workspace/${p.slug}`)}
          sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1.25, py: 1, px: 0.5, textAlign: 'left', borderTop: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}
        >
          {p.solved ? <CheckCircleRoundedIcon color="success" sx={{ fontSize: 20 }} /> : <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid', borderColor: 'divider' }} />}
          <Typography variant="body2" sx={{ flex: 1, minWidth: 0, fontWeight: 600 }} noWrap>{p.title}</Typography>
          <DifficultyChip difficulty={p.difficulty} />
        </ButtonBase>
      ))}
      {problems.length > PROBLEMS_SHOWN && (
        <Button size="small" onClick={() => setAll((v) => !v)} sx={{ mt: 0.5 }}>
          {all ? 'Show fewer' : `Show all ${total ?? problems.length}`}
        </Button>
      )}
    </Box>
  );
}

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

  // legacy whole-feature link (no pattern list on the section)
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

  // Sections arrive in exam order; consecutive sections with the same group share a heading.
  const groups = [];
  roadmap.sections.forEach((s) => {
    const last = groups[groups.length - 1];
    if (last && last.title === s.group) last.items.push(s);
    else groups.push({ title: s.group, items: [s] });
  });

  const countdown = roadmap.examDate ? examCountdown(roadmap.examDate) : null;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
        <CompanyAvatar name={roadmap.name} logoUrl={roadmap.logoUrl} size={56} />
        <Box sx={{ flexGrow: 1, minWidth: 200 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{roadmap.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{roadmap.description}</Typography>
          <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
            {roadmap.examDurationMinutes && (
              <Chip icon={<AccessTimeRoundedIcon sx={{ fontSize: '0.9rem !important' }} />} label={`${roadmap.examDurationMinutes} min exam`} size="small" variant="outlined" />
            )}
            {roadmap.examDate && (
              <Chip
                icon={<CalendarMonthRoundedIcon sx={{ fontSize: '0.9rem !important' }} />}
                label={`${formatExamDate(roadmap.examDate)} · ${countdown.text}`}
                size="small"
                color={countdown.over ? 'default' : 'primary'}
                variant={countdown.over ? 'outlined' : 'filled'}
              />
            )}
          </Stack>
        </Box>
        {roadmap.readiness !== null && <ProgressRing value={roadmap.readiness} max={100} label="Ready" color="#3B82F6" size={90} strokeWidth={8} />}
        {!roadmap.enrolled && (
          <Button variant="contained" disableElevation disabled={enrolling} onClick={handleEnroll} sx={{ fontWeight: 700 }}>
            {enrolling ? 'Enrolling…' : 'Start prepping'}
          </Button>
        )}
      </Paper>

      {groups.map((group) => (
        <Box key={group.title || 'all'} sx={{ mb: 3 }}>
          {group.title && (
            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', fontWeight: 800, letterSpacing: '0.08em', mb: 1 }}>
              {group.title}
            </Typography>
          )}
          <Stack spacing={1.5}>
            {group.items.map((section) => {
              const hard = section.aptitudeDifficulty === 'hard';
              const meta = [section.questionCount ? `${section.questionCount} Q` : null, section.minutes ? `${section.minutes} min` : null].filter(Boolean).join(' · ');
              return (
                <Accordion key={section.id} variant="outlined" sx={{ '&:before': { display: 'none' }, borderRadius: '12px !important', overflow: 'hidden' }}>
                  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', pr: 1 }}>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{section.name}</Typography>
                        {meta && <Typography variant="caption" color="text.secondary">{meta}</Typography>}
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
                        <Chip label={WEAKNESS_LABEL[section.weakness]} size="small" color={WEAKNESS_COLOR[section.weakness]} variant="outlined" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }} />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{section.description}</Typography>

                    {section.trackable && !section.selfReported && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        {section.practiceCount} / {section.target} practiced{hard ? ' (hard questions)' : ''}
                      </Typography>
                    )}

                    {section.contentType === 'external-only' && (
                      <>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          No in-app practice for this section yet. Use the links below.
                        </Typography>
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
                                Self-reported: we can't measure activity on external sites, so this is an honesty checkbox, not a verified score.
                              </Typography>
                            </Typography>
                          }
                        />
                      </>
                    )}

                    {section.patterns?.length > 0 && (
                      <Box sx={{ mb: section.externalResources?.length ? 2 : 0 }}>
                        {section.patterns.map((p) => (
                          <PatternRow key={p.slug} pattern={p} hard={hard} navigate={navigate} />
                        ))}
                      </Box>
                    )}

                    {section.problems && (
                      section.problems.length > 0 ? (
                        <ProblemList problems={section.problems} total={section.problemTotal} navigate={navigate} />
                      ) : (
                        <Typography variant="body2" color="text.secondary">No problems tagged for this section yet.</Typography>
                      )
                    )}

                    {/* sections without a pattern list or problem list keep the plain buttons */}
                    {!section.patterns && !section.problems && (
                      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', mb: section.externalResources?.length ? 2 : 0 }}>
                        {(section.contentType === 'learn-topic' || section.contentType === 'aptitude-pattern') && (
                          <Button size="small" variant="outlined" onClick={() => goToLearn(section)} sx={{ fontWeight: 600 }}>Learn</Button>
                        )}
                        {(section.contentType === 'problem-filter' || section.contentType === 'aptitude-pattern') && (
                          <Button size="small" variant="contained" disableElevation onClick={() => goToPractice(section)} sx={{ fontWeight: 600 }}>Practice</Button>
                        )}
                      </Stack>
                    )}

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
              );
            })}
          </Stack>
        </Box>
      ))}
    </Container>
  );
}
