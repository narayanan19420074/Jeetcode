import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from '@mui/material';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { aptitudeApi } from '../../api/aptitudeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { startAttempt } from './aptitudeSlice';
import { getTopicBySlug } from '../learn/content/topics';

// One of the three Learn / Practice / Test cards. `locked` = Learn isn't
// done yet for this pattern (Practice/Test only); `disabled` = no Learn
// content exists for this slug yet (Learn card only); `done` = green
// check state (Learn card once marked learned).
function StepCard({ icon, title, subtitle, locked, done, onClick, disabled }) {
  return (
    <Paper
      variant="outlined"
      onClick={!locked && !disabled ? onClick : undefined}
      sx={{
        p: 3,
        borderRadius: 3,
        textAlign: 'center',
        cursor: locked || disabled ? 'not-allowed' : 'pointer',
        opacity: locked || disabled ? 0.55 : 1,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        borderColor: done ? 'success.main' : 'divider',
        '&:hover': !locked && !disabled ? { transform: 'translateY(-2px)', boxShadow: 3 } : undefined,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
        {locked ? <LockRoundedIcon color="disabled" /> : done ? <CheckCircleRoundedIcon color="success" /> : icon}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {locked ? 'Complete Learn first' : subtitle}
      </Typography>
    </Paper>
  );
}

export default function AptitudePatternDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [pattern, setPattern] = useState(null);
  const [progress, setProgress] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    setLoading(true);
    aptitudeApi
      .getPattern(slug)
      .then(({ data }) => {
        setPattern(data.data.pattern);
        setProgress(data.data.progress);
        setRecentAttempts(data.data.recentAttempts);
        setError(null);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleStart = async (mode) => {
    setLaunching(true);
    try {
      await dispatch(startAttempt({ slug, mode })).unwrap();
      navigate(`/aptitude/${slug}/${mode}`);
    } catch (err) {
      // If the server-side assertLearnCompleted guard rejects (e.g. stale
      // frontend state), this surfaces the message instead of navigating.
      setError(err);
    } finally {
      setLaunching(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error && !pattern) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const hasLearnContent = !!getTopicBySlug(slug);
  const learnDone = !!progress?.learnCompleted;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        {pattern.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {pattern.description}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Chip label={`${pattern.totalQuestions} questions`} size="small" variant="outlined" />
        <Chip label={`${pattern.timeLimitMinutes} min test`} size="small" variant="outlined" />
        <Chip label={`Pass ${pattern.passPercentage}%`} size="small" variant="outlined" />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <StepCard
          icon={<MenuBookRoundedIcon color="primary" />}
          title="Learn"
          subtitle={hasLearnContent ? 'Concepts & examples' : 'Coming soon'}
          disabled={!hasLearnContent}
          done={learnDone}
          onClick={() => navigate(`/learn/${slug}`)}
        />
        <StepCard
          icon={<SchoolRoundedIcon color="primary" />}
          title="Practice"
          subtitle="No time limit"
          locked={!learnDone}
          onClick={() => handleStart('practice')}
        />
        <StepCard
          icon={<PlayArrowRoundedIcon color="primary" />}
          title="Test"
          subtitle={`${pattern.timeLimitMinutes} min, timed`}
          locked={!learnDone}
          onClick={() => handleStart('test')}
        />
      </Stack>

      {launching && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={20} />
        </Box>
      )}

      {recentAttempts.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Recent Test Attempts
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Score</TableCell>
                <TableCell align="right">Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentAttempts.map((a) => (
                <TableRow key={a._id}>
                  <TableCell>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">{a.score}%</TableCell>
                  <TableCell align="right">{a.timeTakenSec ? `${Math.round(a.timeTakenSec / 60)}m` : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}
