import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Container,
  InputAdornment,
  Link,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import { aptitudeApi } from '../../api/aptitudeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { DIFFICULTY, difficultyMeta } from './components/aptitudeUi';

const PAGE_SIZE = 25;
const mono = { fontFamily: '"JetBrains Mono", "Fira Code", monospace' };

function StatusIcon({ status }) {
  if (status === 'solved') return <CheckCircleRoundedIcon sx={{ fontSize: 20, color: 'success.main' }} titleAccess="Solved" />;
  if (status === 'attempted') return <ErrorOutlineRoundedIcon sx={{ fontSize: 20, color: 'warning.main' }} titleAccess="Attempted, not solved yet" />;
  return <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 20, color: 'text.disabled' }} titleAccess="Not attempted" />;
}

export default function AptitudePracticePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const subPattern = params.get('subPattern') || '';
  const difficulty = params.get('difficulty') || '';
  const status = params.get('status') || '';
  const search = params.get('search') || '';
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);

  const [hub, setHub] = useState(null);
  const [list, setList] = useState(null);
  const [error, setError] = useState(null);
  const [searchDraft, setSearchDraft] = useState(search);
  const [picking, setPicking] = useState(false);

  const update = useCallback(
    (patch) => {
      const next = new URLSearchParams(params);
      Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      if (!('page' in patch)) next.delete('page');
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  useEffect(() => {
    let cancelled = false;
    aptitudeApi
      .getPattern(slug)
      .then(({ data }) => !cancelled && setHub(data.data))
      .catch((err) => !cancelled && setError(extractErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    setList(null);
    aptitudeApi
      .listPracticeQuestions(slug, { subPattern, difficulty, status, search, page, limit: PAGE_SIZE })
      .then(({ data }) => !cancelled && setList(data.data))
      .catch((err) => !cancelled && setError(extractErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [slug, subPattern, difficulty, status, search, page]);

  // Debounce the search box into the URL.
  useEffect(() => {
    if (searchDraft === search) return undefined;
    const t = setTimeout(() => update({ search: searchDraft.trim() }), 350);
    return () => clearTimeout(t);
  }, [searchDraft, search, update]);

  const subTitles = useMemo(() => Object.fromEntries((hub?.practice.bySubPattern ?? []).map((s) => [s.slug, s.title])), [hub]);
  const totals = hub?.practice.totals;
  const byDiff = hub?.practice.byDifficulty;
  const filtersActive = !!(subPattern || difficulty || status || search);

  // LeetCode's "Pick One": random unsolved question inside the current filters.
  const pickRandom = async () => {
    setPicking(true);
    try {
      const { data } = await aptitudeApi.listPracticeQuestions(slug, {
        subPattern,
        difficulty,
        search,
        status: status && status !== 'solved' ? status : 'unsolved',
        limit: 100,
      });
      const pool = data.data.items;
      if (pool.length === 0) {
        setError('Nothing unsolved in this filter — nice work!');
      } else {
        navigate(`/aptitude/${slug}/practice/${pool[Math.floor(Math.random() * pool.length)]._id}`);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setPicking(false);
    }
  };

  const pageCount = list ? Math.max(1, Math.ceil(list.total / PAGE_SIZE)) : 1;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Breadcrumbs sx={{ mb: 1, fontSize: 13 }}>
        <Link component={RouterLink} to="/aptitude" underline="hover" color="text.secondary">
          Aptitude
        </Link>
        <Link component={RouterLink} to={`/aptitude/${slug}`} underline="hover" color="text.secondary">
          {hub?.pattern.title ?? '…'}
        </Link>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Practice
        </Typography>
      </Breadcrumbs>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'flex-end' }, justifyContent: 'space-between', mb: 2.5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Practice
          </Typography>
          <Typography color="text.secondary">Solve at your own pace — every answer comes with the method and the exam shortcut.</Typography>
        </Box>

        {totals && (
          <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
            <Box>
              <Typography sx={{ ...mono, fontWeight: 800, fontSize: 22, lineHeight: 1 }}>
                {totals.solved}
                <Typography component="span" color="text.secondary" sx={{ ...mono, fontSize: 14 }}>
                  /{totals.total}
                </Typography>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                solved
              </Typography>
            </Box>
            {Object.entries(DIFFICULTY).map(([k, m]) => (
              <Box key={k}>
                <Typography sx={{ ...mono, fontWeight: 800, fontSize: 15, color: m.color, lineHeight: 1.2 }}>
                  {byDiff[k].solved}/{byDiff[k].total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {m.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>

      {/* Topic chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 0.5 }}>
        <Chip
          label="All topics"
          clickable
          color={subPattern ? 'default' : 'primary'}
          variant={subPattern ? 'outlined' : 'filled'}
          onClick={() => update({ subPattern: '' })}
        />
        {(hub?.practice.bySubPattern ?? [])
          .filter((s) => s.total > 0)
          .map((s) => (
            <Chip
              key={s.slug}
              clickable
              label={`${s.title} · ${s.solved}/${s.total}`}
              color={subPattern === s.slug ? 'primary' : 'default'}
              variant={subPattern === s.slug ? 'filled' : 'outlined'}
              onClick={() => update({ subPattern: s.slug })}
              sx={{ flexShrink: 0 }}
            />
          ))}
      </Stack>

      {/* Filters */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: { md: 'center' }, mb: 2 }}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={difficulty}
          onChange={(_, v) => update({ difficulty: v ?? '' })}
          aria-label="Difficulty"
        >
          {Object.entries(DIFFICULTY).map(([k, m]) => (
            <ToggleButton key={k} value={k} sx={{ px: 1.75, textTransform: 'none', fontWeight: 700, '&.Mui-selected': { color: m.color, bgcolor: alpha(m.color, 0.12) } }}>
              {m.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Select size="small" displayEmpty value={status} onChange={(e) => update({ status: e.target.value })} sx={{ minWidth: 170 }}>
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="todo">Todo (not tried)</MenuItem>
          <MenuItem value="attempted">Attempted</MenuItem>
          <MenuItem value="solved">Solved</MenuItem>
          <MenuItem value="unsolved">Not solved yet</MenuItem>
          <MenuItem value="bookmarked">Bookmarked</MenuItem>
        </Select>

        <TextField
          size="small"
          placeholder="Search questions"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: { md: 320 } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> } }}
        />

        <Box sx={{ flexGrow: 1 }} />
        {filtersActive && (
          <Button size="small" onClick={() => { setSearchDraft(''); setParams({}, { replace: true }); }}>
            Clear filters
          </Button>
        )}
        <Button variant="contained" disableElevation startIcon={picking ? <CircularProgress size={16} color="inherit" /> : <ShuffleRoundedIcon />} disabled={picking} onClick={pickRandom}>
          Pick one
        </Button>
      </Stack>

      {error && <Alert severity="info" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

      {/* Problem list */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ display: { xs: 'none', sm: 'grid' }, gridTemplateColumns: '44px 56px 1fr 190px 96px 84px', px: 2, py: 1.1, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
          {['', '#', 'Question', 'Topic', 'Accept.', 'Level'].map((h, i) => (
            <Typography key={i} variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textAlign: i >= 4 ? 'right' : 'left' }}>
              {h}
            </Typography>
          ))}
        </Box>

        {!list &&
          Array.from({ length: 8 }, (_, i) => <Skeleton key={i} variant="rectangular" height={52} sx={{ mb: '1px' }} />)}

        {list && list.items.length === 0 && (
          <Box sx={{ py: 7, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 700 }}>No questions match these filters</Typography>
            <Typography variant="body2" color="text.secondary">
              Try a different topic or clear the filters.
            </Typography>
          </Box>
        )}

        {list?.items.map((q) => {
          const dm = difficultyMeta(q.difficulty);
          return (
            <Box
              key={q._id}
              onClick={() => navigate(`/aptitude/${slug}/practice/${q._id}`)}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '36px 1fr 70px', sm: '44px 56px 1fr 190px 96px 84px' },
                alignItems: 'center',
                px: 2,
                py: 1.25,
                cursor: 'pointer',
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-of-type': { borderBottom: 'none' },
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <StatusIcon status={q.status} />
              <Typography variant="body2" color="text.secondary" sx={{ ...mono, display: { xs: 'none', sm: 'block' } }}>
                {q.order}
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0, pr: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {q.title}
                </Typography>
                {q.bookmarked && <StarRoundedIcon sx={{ fontSize: 16, color: 'warning.main', flexShrink: 0 }} />}
              </Stack>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: 'none', sm: 'block' }, pr: 1 }}>
                {subTitles[q.subPattern] ?? q.subPattern}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ...mono, textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                {q.acceptance == null ? '—' : `${q.acceptance}%`}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: dm.color, textAlign: 'right' }}>
                {dm.label}
              </Typography>
            </Box>
          );
        })}
      </Paper>

      {list && list.total > PAGE_SIZE && (
        <Stack sx={{ alignItems: 'center', mt: 3 }}>
          <Pagination count={pageCount} page={page} onChange={(_, p) => update({ page: String(p) })} color="primary" shape="rounded" />
        </Stack>
      )}
      {list && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>
          {list.total} question{list.total === 1 ? '' : 's'}
        </Typography>
      )}
    </Container>
  );
}
