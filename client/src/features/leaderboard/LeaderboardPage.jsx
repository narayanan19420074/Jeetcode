import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container, Box, Typography, Paper, Tabs, Tab, ToggleButtonGroup, ToggleButton, Table, TableHead, TableRow, TableCell,
  TableBody, Avatar, Chip, Pagination, CircularProgress, Alert, Stack, Tooltip,
} from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import { leaderboardApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import { difficultyColor } from '../../theme/theme';

const LIMIT = 25;
const MEDAL = { 1: '#F59E0B', 2: '#94A3B8', 3: '#B45309' };
const PERIODS = [
  { value: 'all', label: 'All time' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
];

const Rank = ({ rank }) =>
  MEDAL[rank] ? (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: MEDAL[rank], fontWeight: 800 }}>
      <EmojiEventsRoundedIcon fontSize="small" />{rank}
    </Box>
  ) : (
    <Typography sx={{ fontWeight: 700 }}>{rank}</Typography>
  );

const Solved = ({ row }) => (
  <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
    {[['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']].map(([k, label]) => (
      <Tooltip key={k} title={label}>
        <Chip size="small" label={row[k]} sx={{ color: difficultyColor(label), bgcolor: `${difficultyColor(label)}1A`, fontWeight: 700, minWidth: 34 }} />
      </Tooltip>
    ))}
    <Tooltip title="Aptitude"><Chip size="small" variant="outlined" label={`Apt ${row.aptitude}`} sx={{ fontWeight: 700 }} /></Tooltip>
  </Stack>
);

export default function LeaderboardPage() {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const [period, setPeriod] = useState('all');
  const [scope, setScope] = useState('global');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    leaderboardApi
      .get({ period, scope, page, limit: LIMIT })
      .then(({ data: res }) => { if (!cancelled) { setData(res.data); setError(''); } })
      .catch((err) => { if (!cancelled) setError(extractErrorMessage(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period, scope, page]);

  const pages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;
  const me = data?.me;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>Leaderboard</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Points: Easy {data?.points?.easy ?? 10} · Medium {data?.points?.medium ?? 20} · Hard {data?.points?.hard ?? 40} · Aptitude {data?.points?.aptitude ?? 5} each. Each question counts once.
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <Tabs value={period} onChange={(_, v) => { setPeriod(v); setPage(1); }} sx={{ flexGrow: 1 }}>
          {PERIODS.map((p) => <Tab key={p.value} value={p.value} label={p.label} />)}
        </Tabs>
        <ToggleButtonGroup size="small" exclusive value={scope} onChange={(_, v) => { if (v) { setScope(v); setPage(1); } }}>
          <ToggleButton value="global" sx={{ px: 2 }}>Global</ToggleButton>
          <ToggleButton value="friends" sx={{ px: 2 }} disabled={!isAuthenticated}>Friends</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {isAuthenticated && data && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', borderColor: 'primary.main' }}>
          {me ? (
            <>
              <Typography variant="h5" sx={{ fontWeight: 800, minWidth: 56 }}>#{me.rank}</Typography>
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>Your rank · {me.score} pts</Typography>
                <Typography variant="body2" color="text.secondary">
                  {me.solved} solved · of {data.total.toLocaleString()} {scope === 'friends' ? 'in your circle' : 'learners'}
                </Typography>
              </Box>
              <Solved row={me} />
            </>
          ) : (
            <Typography color="text.secondary">
              Solve a problem {period === 'all' ? '' : 'in this period '}to get ranked. <Typography component={RouterLink} to="/problems" sx={{ color: 'primary.main', fontWeight: 700 }}>Browse problems</Typography>
            </Typography>
          )}
        </Paper>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 3, overflowX: 'auto', position: 'relative' }}>
        {loading && <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper', opacity: 0.6, zIndex: 1 }}><CircularProgress /></Box>}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 72 }}>Rank</TableCell>
              <TableCell>Learner</TableCell>
              <TableCell align="right">Score</TableCell>
              <TableCell align="center">Solved</TableCell>
              <TableCell align="center" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Streak</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.rows.map((r) => (
              <TableRow key={r.userId} sx={{ bgcolor: me && r.userId === me.userId ? 'action.selected' : undefined }}>
                <TableCell><Rank rank={r.rank} /></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Avatar src={r.avatarUrl || undefined} sx={{ width: 32, height: 32, fontSize: 14 }}>{r.name?.[0]?.toUpperCase()}</Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{r.name}</Typography>
                      <Typography variant="caption" color="text.secondary">@{r.handle}{r.company ? ` · ${r.company}` : ''}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>{r.score.toLocaleString()}</TableCell>
                <TableCell><Solved row={r} /></TableCell>
                <TableCell align="center" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                    <LocalFireDepartmentRoundedIcon sx={{ fontSize: 16, color: r.streak ? 'warning.main' : 'text.disabled' }} />{r.streak}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {data && data.rows.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                {scope === 'friends' ? 'Join a friend’s study plan to see them here.' : 'No one has scored in this period yet — be the first!'}
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {pages > 1 && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><Pagination count={pages} page={page} onChange={(_, v) => setPage(v)} /></Box>}
      {data?.updatedAt && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>Updated {new Date(data.updatedAt).toLocaleTimeString()} · refreshes every few minutes</Typography>}
    </Container>
  );
}
