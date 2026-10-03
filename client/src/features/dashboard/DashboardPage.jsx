import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Chip,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DifficultyChip from '../../components/DifficultyChip';
import PrepReadinessCard from '../../components/PrepReadinessCard';
import SolvedCard from '../../components/SolvedCard';
import { problemsApi } from '../../api/problemsApi';
import { usersApi } from '../../api/usersApi';
import { submissionsApi } from '../../api/submissionsApi';

const SUGGESTED_PROBLEMS_COUNT = 5;

const statusColor = {
  Accepted: 'success',
  'Wrong Answer': 'error',
  'Time Limit Exceeded': 'warning',
  'Runtime Error': 'error',
  'Compilation Error': 'error',
  Pending: 'default',
  Judging: 'default',
};

// Deterministic "featured problem of the day" — picks the same problem all
// day without needing a dedicated backend field. Uses page=N, limit=1 so we
// only ever transfer one problem, not the whole catalog.
function featuredPageForToday(total) {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return (dayIndex % total) + 1;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [activity, setActivity] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [suggested, setSuggested] = useState([]);

  // Featured problem + per-difficulty totals (for progress ring max values).
  const [featured, setFeatured] = useState(null);
  const [difficultyTotals, setDifficultyTotals] = useState({ Easy: 1, Medium: 1, Hard: 1 });

  useEffect(() => {
    Promise.all([
      problemsApi.list({ page: 1, limit: 1 }),
      problemsApi.list({ page: 1, limit: 1, difficulty: 'Easy' }),
      problemsApi.list({ page: 1, limit: 1, difficulty: 'Medium' }),
      problemsApi.list({ page: 1, limit: 1, difficulty: 'Hard' }),
    ])
      .then(([all, easy, medium, hard]) => {
        setDifficultyTotals({
          Easy: Math.max(easy.data.data.pagination.total, 1),
          Medium: Math.max(medium.data.data.pagination.total, 1),
          Hard: Math.max(hard.data.data.pagination.total, 1),
        });
        const total = all.data.data.pagination.total;
        if (total > 0) {
          return problemsApi.list({ page: featuredPageForToday(total), limit: 1 });
        }
        return null;
      })
      .then((res) => {
        if (res) setFeatured(res.data.data.items[0]);
      })
      .catch(() => {});

    // Lightweight "Suggested Problems" list — deliberately just 5 items
    // with no search/filter/pagination UI. Deep browsing lives on the
    // dedicated /problems page; duplicating that whole experience here
    // was confusing (two places doing the same job) and slowed the
    // dashboard down for no real benefit.
    problemsApi
      .list({ page: 1, limit: SUGGESTED_PROBLEMS_COUNT, sort: 'newest' })
      .then(({ data }) => setSuggested(data.data.items))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    usersApi.activity().then(({ data }) => setActivity(data.data)).catch(() => {});
    submissionsApi.history({ limit: 5 }).then(({ data }) => setSubmissions(data.data.items)).catch(() => {});
  }, [isAuthenticated]);

  const totalSolved = user ? user.easySolved + user.mediumSolved + user.hardSolved : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {!isAuthenticated && (
        <Paper
          variant="outlined"
          sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            You're browsing as a guest. Sign up to save streaks, track submissions, and unlock AI hints — free.
          </Typography>
          <Button variant="contained" disableElevation size="small" onClick={() => navigate('/login')} sx={{ fontWeight: 700 }}>
            Sign up free
          </Button>
        </Paper>
      )}

      {/* Stats row — quick-glance personal numbers. Kept intentionally
          compact; this is context, not the main event. */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SolvedCard user={user} isAuthenticated={isAuthenticated} totals={difficultyTotals} activity={activity} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: (t) => (t.palette.mode === 'dark' ? 'linear-gradient(160deg, rgba(59,130,246,0.14), transparent)' : 'linear-gradient(160deg, rgba(59,130,246,0.08), transparent)'),
            }}
          >
            {featured ? (
              <>
                <Box>
                  <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                    Featured
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {featured.title}
                  </Typography>
                  <DifficultyChip difficulty={featured.difficulty} />
                </Box>
                <Button
                  variant="contained"
                  disableElevation
                  sx={{ fontWeight: 700, mt: 2 }}
                  onClick={() => navigate(`/workspace/${featured.slug}`)}
                >
                  Solve now
                </Button>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No problems published yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Prep hero — full width, visually distinct from the stat cards
          above. This is the flagship next-action, not one tile among
          several. */}
      <PrepReadinessCard />

      {/* Suggested problems — a short taste, not the whole catalog.
          Deep browsing (search/filter/pagination) belongs on /problems;
          duplicating that entire experience here was confusing and slow. */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Suggested Problems
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => navigate('/problems')}
            sx={{ fontWeight: 700 }}
          >
            View all
          </Button>
        </Box>
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {suggested.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
              No problems to suggest yet.
            </Typography>
          ) : (
            suggested.map((p, i) => (
              <Box
                key={p._id}
                onClick={() => navigate(`/workspace/${p.slug}`)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  px: 2.5,
                  py: 1.75,
                  cursor: 'pointer',
                  borderTop: i === 0 ? 'none' : '1px solid',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {p.title}
                </Typography>
                <DifficultyChip difficulty={p.difficulty} />
              </Box>
            ))
          )}
        </Paper>
      </Box>

      {/* Recent submissions */}
      {isAuthenticated && (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, mt: 3, overflow: 'hidden' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Recent Submissions
          </Typography>
          {submissions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No submissions yet — solve a problem to see your history here.
            </Typography>
          ) : (
            <>
            <Stack sx={{ display: { xs: 'flex', sm: 'none' } }}>
              {submissions.map((s, i) => (
                <Box key={s._id} sx={{ py: 1.5, borderTop: i === 0 ? 'none' : '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600, minWidth: 0 }}>
                      {s.problem?.title ?? 'Unknown'}
                    </Typography>
                    <Chip label={s.status} size="small" color={statusColor[s.status] || 'default'} variant="outlined" sx={{ flexShrink: 0 }} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    <span style={{ textTransform: 'capitalize' }}>{s.language}</span>
                    {' · '}
                    {s.runtimeMs != null ? `${s.runtimeMs}ms` : '-'}
                    {' · '}
                    {new Date(s.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Problem</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Language</TableCell>
                    <TableCell>Runtime</TableCell>
                    <TableCell align="right">When</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((s) => (
                    <TableRow key={s._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{s.problem?.title ?? 'Unknown'}</TableCell>
                      <TableCell>
                        <Chip label={s.status} size="small" color={statusColor[s.status] || 'default'} variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{s.language}</TableCell>
                      <TableCell>{s.runtimeMs != null ? `${s.runtimeMs}ms` : '-'}</TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>
                        {new Date(s.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            </>
          )}
        </Paper>
      )}
    </Container>
  );
}
