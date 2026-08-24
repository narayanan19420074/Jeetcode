import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { aptitudeApi } from '../../api/aptitudeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { startAttempt } from './aptitudeSlice';

export default function AptitudePatternDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [pattern, setPattern] = useState(null);
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

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        {pattern.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {pattern.description}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip label={`${pattern.totalQuestions} questions`} size="small" variant="outlined" />
          <Chip label={`${pattern.timeLimitMinutes} min test`} size="small" variant="outlined" />
          <Chip label={`Pass ${pattern.passPercentage}%`} size="small" variant="outlined" />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<PlayArrowRoundedIcon />}
            disabled={launching}
            onClick={() => handleStart('test')}
          >
            Start Test
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<SchoolRoundedIcon />}
            disabled={launching}
            onClick={() => handleStart('practice')}
          >
            Practice
          </Button>
        </Stack>
      </Paper>

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
