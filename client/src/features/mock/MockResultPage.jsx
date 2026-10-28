import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, ButtonBase, CircularProgress, Collapse, Container, LinearProgress, Typography } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { mockApi } from '../../api/mockApi';
import { extractErrorMessage } from '../../api/apiClient';
import { OPTION_LABELS, difficultyMeta, formatDuration } from '../aptitude/components/aptitudeUi';
import { PLAN_AMBER } from '../studyplan/planUtils';

const verdict = (s) => (s >= 75 ? 'Strong. Keep the pace.' : s >= 60 ? 'Solid. A few topics are holding you back.' : s >= 40 ? 'Getting there. Fix the weak topics below.' : 'Needs work. Start with the weakest topics.');
const barColor = (v) => (v >= 70 ? '#10B981' : v >= 50 ? '#F59E0B' : '#EF4444');

function Card({ children, sx }) {
  return <Box sx={(t) => ({ p: 1.75, borderRadius: '14px', bgcolor: 'background.paper', border: `1px solid ${t.palette.divider}`, ...sx })}>{children}</Box>;
}

function Stat({ label, value }) {
  return (
    <Box sx={{ textAlign: 'center', flex: 1 }}>
      <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', lineHeight: 1.2 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  );
}

function ReviewItem({ r }) {
  const [open, setOpen] = useState(false);
  const skipped = r.selectedOption === null;
  const tone = skipped ? '#94A3B8' : r.isCorrect ? '#10B981' : '#EF4444';
  return (
    <Box sx={(t) => ({ borderRadius: '12px', border: `1px solid ${t.palette.divider}`, overflow: 'hidden' })}>
      <ButtonBase onClick={() => setOpen((o) => !o)} sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, textAlign: 'left', fontFamily: 'inherit' }}>
        <Box sx={{ width: 26, height: 26, borderRadius: '8px', display: 'grid', placeItems: 'center', bgcolor: tone, color: '#fff', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{r.n}</Box>
        <Typography noWrap sx={{ flex: 1, fontSize: '0.88rem' }}>{r.questionText}</Typography>
        <ExpandMoreRoundedIcon sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: 'text.secondary' }} />
      </ButtonBase>
      <Collapse in={open} unmountOnExit>
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Typography sx={{ whiteSpace: 'pre-line', mb: 1, fontSize: '0.92rem' }}>{r.questionText}</Typography>
          {r.options.map((o, i) => {
            const right = i === r.correctOptionIndex;
            const mine = i === r.selectedOption;
            return (
              <Typography key={i} variant="body2" sx={{ py: 0.4, fontWeight: right || mine ? 800 : 400, color: right ? '#10B981' : mine ? '#EF4444' : 'text.secondary' }}>
                {OPTION_LABELS[i]}. {o}{right ? '  ✓' : mine ? '  (your answer)' : ''}
              </Typography>
            );
          })}
          {skipped && <Typography variant="caption" color="text.secondary">You skipped this one.</Typography>}
          {r.explanation && <Typography variant="body2" sx={{ mt: 1 }}><b>Why:</b> {r.explanation}</Typography>}
          {r.shortcut && <Typography variant="body2" sx={{ mt: 0.75 }}><b>Shortcut:</b> {r.shortcut}</Typography>}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {r.topic} · {difficultyMeta(r.difficulty).label} · {formatDuration(r.timeSpentSec)}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}

export default function MockResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [r, setR] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    mockApi.getResult(attemptId).then(({ data }) => setR(data.data)).catch((e) => setError(extractErrorMessage(e)));
  }, [attemptId]);

  const shown = useMemo(() => {
    if (!r) return [];
    if (filter === 'wrong') return r.review.filter((x) => x.selectedOption !== null && !x.isCorrect);
    if (filter === 'skipped') return r.review.filter((x) => x.selectedOption === null);
    return r.review;
  }, [r, filter]);

  if (error) return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert><Button sx={{ mt: 2 }} onClick={() => navigate('/mocks')}>Back</Button></Container>;
  if (!r) return <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}><CircularProgress /></Box>;

  const weak = r.topics.filter((t) => t.accuracy < 60).slice(0, 3);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 3 }, display: 'grid', gap: 1.5 }}>
      <Card sx={{ textAlign: 'center', py: 2.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>{r.paperTitle}</Typography>
        <Typography sx={{ fontWeight: 900, fontSize: '3rem', lineHeight: 1.1 }}>{Math.round(r.score)}%</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>{verdict(r.score)}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Stat label="Correct" value={`${r.correctCount}/${r.totalCount}`} />
          <Stat label="Attempted" value={r.attempted} />
          <Stat label="Time" value={formatDuration(r.timeTakenSec)} />
          <Stat label="Percentile" value={r.percentile === null ? '–' : `${r.percentile}`} />
        </Box>
        {r.percentile === null && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Percentile shows once 20 people have taken this paper.</Typography>}
        {r.status === 'expired' && <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>The clock ran out before you submitted.</Typography>}
      </Card>

      <Card>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>By section</Typography>
        {r.sections.map((s) => (
          <Box key={s.key} sx={{ mb: 1.25 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.title}</Typography>
              <Typography variant="body2">{s.correct}/{s.total} · {formatDuration(s.usedSec)} of {formatDuration(s.allowedSec)}</Typography>
            </Box>
            <LinearProgress variant="determinate" value={s.accuracy} sx={{ height: 8, borderRadius: 4, mt: 0.5, '& .MuiLinearProgress-bar': { bgcolor: barColor(s.accuracy) } }} />
          </Box>
        ))}
      </Card>

      <Card>
        <Typography sx={{ fontWeight: 800, mb: 0.5 }}>By topic (weakest first)</Typography>
        {weak.length > 0 && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Focus here first: {weak.map((t) => t.title).join(', ')}.</Typography>}
        {r.topics.map((t) => (
          <Box key={t.slug} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap variant="body2" sx={{ fontWeight: 700 }}>{t.title}</Typography>
              <LinearProgress variant="determinate" value={t.accuracy} sx={{ height: 6, borderRadius: 3, mt: 0.4, '& .MuiLinearProgress-bar': { bgcolor: barColor(t.accuracy) } }} />
            </Box>
            <Typography variant="caption" sx={{ width: 74, textAlign: 'right' }}>{t.correct}/{t.total} · {formatDuration(t.avgTimeSec)}/q</Typography>
            {t.slug && <Button size="small" onClick={() => navigate(`/aptitude/${t.slug}/practice`)} sx={{ fontWeight: 800, minWidth: 0 }}>Practice</Button>}
          </Box>
        ))}
      </Card>

      <Card>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>By difficulty</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {r.byDifficulty.map((d) => (
            <Stat key={d.difficulty} label={difficultyMeta(d.difficulty).label} value={`${d.correct}/${d.total}`} />
          ))}
        </Box>
      </Card>

      <Box>
        <Box sx={{ display: 'flex', gap: 0.75, mb: 1, alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 800, flex: 1 }}>Review answers</Typography>
          {['all', 'wrong', 'skipped'].map((k) => (
            <ButtonBase key={k} onClick={() => setFilter(k)} sx={(t) => ({ px: 1.25, height: 28, borderRadius: 99, fontSize: 12, fontWeight: 800, fontFamily: 'inherit', border: `1px solid ${filter === k ? PLAN_AMBER : t.palette.divider}`, bgcolor: filter === k ? PLAN_AMBER : 'transparent', color: filter === k ? '#1B1200' : 'text.primary' })}>
              {k === 'all' ? 'All' : k === 'wrong' ? 'Wrong' : 'Skipped'}
            </ButtonBase>
          ))}
        </Box>
        <Box sx={{ display: 'grid', gap: 0.75 }}>
          {shown.map((x) => <ReviewItem key={x.n} r={x} />)}
          {shown.length === 0 && <Typography variant="body2" color="text.secondary">Nothing here.</Typography>}
        </Box>
      </Box>

      <Button variant="contained" disableElevation onClick={() => navigate('/mocks')} sx={{ fontWeight: 800, bgcolor: PLAN_AMBER, color: '#1B1200', '&:hover': { bgcolor: '#F5B50F' } }}>Back to mock tests</Button>
    </Container>
  );
}
