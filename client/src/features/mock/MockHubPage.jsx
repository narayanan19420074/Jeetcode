import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import { mockApi } from '../../api/mockApi';
import { extractErrorMessage } from '../../api/apiClient';
import CompanyAvatar from '../../components/CompanyAvatar';
import BackToDashboard from '../../components/BackToDashboard';
import { PLAN_AMBER } from '../studyplan/planUtils';

const when = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

function PaperCard({ paper, busy, onStart }) {
  const navigate = useNavigate();
  const resume = Boolean(paper.openAttemptId);
  return (
    <Box sx={(t) => ({ display: 'flex', flexDirection: 'column', gap: 1.25, p: 1.75, borderRadius: '14px', bgcolor: 'background.paper', border: `1px solid ${t.palette.divider}` })}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <CompanyAvatar name={paper.company} size={40} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.25 }}>{paper.title}</Typography>
          <Typography variant="caption" color="text.secondary">{paper.short}</Typography>
        </Box>
        {paper.bestScore !== null && (
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', lineHeight: 1 }}>{Math.round(paper.bestScore)}%</Typography>
            <Typography variant="caption" color="text.secondary">best</Typography>
          </Box>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary">{paper.blurb}</Typography>

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', color: 'text.secondary' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><QuizRoundedIcon sx={{ fontSize: 16 }} /><Typography variant="caption" sx={{ fontWeight: 700 }}>{paper.questions} questions</Typography></Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><TimerRoundedIcon sx={{ fontSize: 16 }} /><Typography variant="caption" sx={{ fontWeight: 700 }}>{paper.minutes} min</Typography></Box>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>{paper.sections.length} {paper.sections.length === 1 ? 'section' : 'sections'}</Typography>
      </Box>

      {paper.comingSoon.length > 0 && (
        <Typography variant="caption" color="text.secondary">Coming soon: {paper.comingSoon.join(', ')}</Typography>
      )}

      <Box sx={{ display: 'flex', gap: 0.75, mt: 'auto', pt: 0.5 }}>
        {paper.locked ? (
          <Button fullWidth disableElevation startIcon={<LockRoundedIcon />} onClick={() => navigate('/pricing')}
            sx={{ height: 38, borderRadius: '10px', fontWeight: 800, bgcolor: PLAN_AMBER, color: '#1B1200', '&:hover': { bgcolor: '#F5B50F' } }}>
            Go Pro for more attempts
          </Button>
        ) : (
          <Button fullWidth disableElevation disabled={!paper.available || busy} startIcon={busy ? <CircularProgress size={16} /> : <PlayArrowRoundedIcon />}
            onClick={() => onStart(paper)}
            sx={{ height: 38, borderRadius: '10px', fontWeight: 800, bgcolor: PLAN_AMBER, color: '#1B1200', '&:hover': { bgcolor: '#F5B50F' } }}>
            {!paper.available ? 'Questions being added' : resume ? 'Resume paper' : paper.attemptsCount ? 'Take again' : 'Start mock'}
          </Button>
        )}
        {paper.officialUrl && (
          <Button component="a" href={paper.officialUrl} target="_blank" rel="noopener noreferrer" aria-label={`${paper.company} official site`}
            sx={(t) => ({ minWidth: 38, width: 38, height: 38, borderRadius: '10px', color: 'text.secondary', border: `1px solid ${t.palette.divider}` })}>
            <LaunchRoundedIcon sx={{ fontSize: 18 }} />
          </Button>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>{paper.reported}</Typography>
    </Box>
  );
}

export default function MockHubPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    mockApi.list().then(({ data: r }) => setData(r.data)).catch((e) => setError(extractErrorMessage(e)));
  }, []);

  const begin = async (paper) => {
    setBusy(true);
    setError('');
    try {
      const { data: r } = await mockApi.start(paper.id);
      navigate(`/mocks/attempt/${r.data.attemptId}`);
    } catch (e) {
      setError(extractErrorMessage(e));
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  const onStart = (paper) => (paper.openAttemptId ? navigate(`/mocks/attempt/${paper.openAttemptId}`) : setConfirm(paper));

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 2.5 }, px: { xs: 1.5, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 2 }}>
        <BackToDashboard sx={{ mt: 0.25 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.01em', lineHeight: 1.2 }}>Mock tests</Typography>
          <Typography variant="body2" color="text.secondary">Full timed papers in the real exam format. Sectional clocks, no negative marking, a topic report at the end.</Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {!data && !error && <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}><CircularProgress /></Box>}

      {data && (
        <>
          {!data.hasProAccess && (
            <Alert severity="info" sx={{ mb: 2 }}>Free plan: {data.freeAttemptsPerPaper} attempt per paper. Pro gives unlimited mocks.</Alert>
          )}
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' } }}>
            {data.papers.map((p) => <PaperCard key={p.id} paper={p} busy={busy && confirm?.id === p.id} onStart={onStart} />)}
          </Box>

          {data.recent.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography sx={{ fontWeight: 800, mb: 1 }}>Recent attempts</Typography>
              <Box sx={(t) => ({ borderRadius: '14px', border: `1px solid ${t.palette.divider}`, bgcolor: 'background.paper', overflow: 'hidden' })}>
                {data.recent.map((a, i) => (
                  <Box key={a.id} onClick={() => navigate(`/mocks/result/${a.id}`)} role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/mocks/result/${a.id}`)}
                    sx={(t) => ({ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.75, py: 1.25, cursor: 'pointer', borderTop: i ? `1px solid ${t.palette.divider}` : 'none', '&:hover': { bgcolor: 'action.hover' } })}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{a.paperTitle}</Typography>
                      <Typography variant="caption" color="text.secondary">{when(a.createdAt)} · {a.correctCount}/{a.totalCount} correct</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 900 }}>{Math.round(a.score)}%</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </>
      )}

      <Dialog open={Boolean(confirm)} onClose={() => !busy && setConfirm(null)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
        {confirm && (
          <>
            <DialogTitle sx={{ fontWeight: 900 }}>{confirm.title}</DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 1.5 }}>{confirm.questions} questions · {confirm.minutes} minutes</Typography>
              {confirm.sections.map((s) => (
                <Typography key={s.key} variant="body2" color="text.secondary">• {s.title}: {s.questions} questions, {s.minutes} min</Typography>
              ))}
              <Box component="ul" sx={{ pl: 2.5, mt: 1.5, mb: 0, color: 'text.secondary', fontSize: '0.85rem' }}>
                <li>Each section has its own clock. When it ends, the section locks.</li>
                <li>Once you submit a section you cannot go back to it.</li>
                <li>No negative marking. Attempt every question.</li>
                <li>Your answers autosave. If you refresh, you resume where you were.</li>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setConfirm(null)} disabled={busy}>Cancel</Button>
              <Button variant="contained" disableElevation disabled={busy} onClick={() => begin(confirm)} sx={{ fontWeight: 800 }}>
                {busy ? 'Starting…' : 'Start now'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}
