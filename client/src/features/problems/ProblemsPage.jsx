import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Box, Button, Container, Skeleton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { problemsApi } from '../../api/problemsApi';
import ProblemLibrary from '../dashboard/components/ProblemLibrary';
import useProblemLists from '../dashboard/useProblemLists';
import useViewportFill from '../dashboard/useViewportFill';
import { DIFF_COLOR, featuredPageForToday, surface, tint } from '../dashboard/dashboardUtils';
import BackToDashboard from '../../components/BackToDashboard';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

// Same problem library as the dashboard (topic pills, sticky search, sortable
// columns, infinite scroll, save-to-list stars), hosted on its own page with a
// progress header. On wide screens the page is one window tall and only the
// problem list scrolls, exactly like the dashboard.

function DifficultyStat({ label, solved, total }) {
  const pct = total ? Math.min((solved / total) * 100, 100) : 0;
  const color = DIFF_COLOR[label];
  return (
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {solved}
          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            /{total}
          </Box>
        </Typography>
      </Stack>
      <Box sx={{ height: 6, borderRadius: 999, overflow: 'hidden', bgcolor: tint(color, 18) }}>
        <Box sx={{ width: `${pct}%`, height: '100%', borderRadius: 999, bgcolor: color, transition: 'width .5s cubic-bezier(.4,0,.2,1)' }} />
      </Box>
    </Box>
  );
}

function ProgressHeader({ progress, featured, savedCount }) {
  const totals = progress?.total;
  const solvedBy = progress?.solved;
  const totalAll = totals ? DIFFICULTIES.reduce((s, d) => s + (totals[d] || 0), 0) : 0;
  const solvedAll = solvedBy ? DIFFICULTIES.reduce((s, d) => s + (solvedBy[d] || 0), 0) : 0;

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={{ xs: 1.5, md: 3 }}
      sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
          Problems
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {progress ? `${solvedAll} of ${totalAll} solved` : 'Loading your progress…'}
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
        <Box sx={[surface, { px: 2, py: 1.25, display: 'flex', gap: 2.5, width: { xs: '100%', sm: 340 }, flexShrink: 0 }]}>
          {progress
            ? DIFFICULTIES.map((d) => <DifficultyStat key={d} label={d} solved={solvedBy?.[d] || 0} total={totals?.[d] || 0} />)
            : DIFFICULTIES.map((d) => <Skeleton key={d} variant="rounded" height={30} sx={{ flex: 1 }} />)}
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          {featured && (
            <Button
              component={RouterLink}
              to={`/workspace/${featured.slug}`}
              variant="contained"
              disableElevation
              startIcon={<EventRoundedIcon />}
              sx={{ fontWeight: 700, whiteSpace: 'nowrap', flex: { xs: 1, sm: 'none' } }}
            >
              Today&apos;s challenge
            </Button>
          )}
          <Button
            component={RouterLink}
            to="/dashboard?view=list&list=favorite"
            variant="outlined"
            color="inherit"
            startIcon={<StarRoundedIcon sx={{ color: 'warning.main' }} />}
            sx={(t) => ({ fontWeight: 700, whiteSpace: 'nowrap', borderColor: t.palette.divider, flex: { xs: 1, sm: 'none' } })}
          >
            My lists{savedCount > 0 ? ` · ${savedCount}` : ''}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}

export default function ProblemsPage() {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const rootRef = useRef(null);
  const fillH = useViewportFill(rootRef, isLg);
  const listsApi = useProblemLists(user?.id);

  const [progress, setProgress] = useState(null);
  const [featured, setFeatured] = useState(null);

  // Totals + solved counts, then today's featured problem (same deterministic pick as the dashboard).
  useEffect(() => {
    let cancelled = false;
    problemsApi
      .getProgress()
      .then(({ data }) => {
        if (cancelled) return null;
        setProgress(data.data);
        const t = data.data.total;
        const total = t.Easy + t.Medium + t.Hard;
        return total > 0 ? problemsApi.list({ page: featuredPageForToday(total), limit: 1 }) : null;
      })
      .then((res) => {
        if (!cancelled && res) setFeatured(res.data.data.items[0] || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Deep links such as /problems?company=TCS&tag=Array&difficulty=Hard (used by Company Prep) seed the library filters.
  const [params] = useSearchParams();
  const urlKey = params.toString();
  const preset = useMemo(() => {
    const sp = new URLSearchParams(urlKey);
    const tags = sp.getAll('tag');
    const companies = sp.getAll('company');
    const d = sp.get('difficulty');
    const difficulty = DIFFICULTIES.includes(d) ? d : undefined;
    if (!tags.length && !companies.length && !difficulty) return null;
    return { tags, companies, difficulty };
  }, [urlKey]);

  const savedCount = useMemo(() => {
    const ids = new Set();
    listsApi.lists.forEach((l) => l.items.forEach((i) => ids.add(i._id)));
    return ids.size;
  }, [listsApi.lists]);

  return (
    <Box ref={rootRef} sx={fillH ? { height: fillH, overflow: 'hidden' } : { minHeight: 'calc(100vh - 64px)' }}>
      <Container
        maxWidth={false}
        sx={{
          maxWidth: 1180,
          py: { xs: 2, md: 3 },
          px: { xs: 1.5, sm: 3 },
          height: fillH ? '100%' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 2, md: 2.5 },
        }}
      >
        <BackToDashboard sx={{ alignSelf: 'flex-start', mb: -1 }} />
        <ProgressHeader progress={progress} featured={featured} savedCount={savedCount} />

        <Box sx={{ flex: { lg: 1 }, minHeight: 0 }}>
          <ProblemLibrary
            isAuthenticated={isAuthenticated}
            progress={progress}
            dailyId={featured?._id}
            preset={preset}
            listsApi={listsApi}
            height="100%"
          />
        </Box>
      </Container>
    </Box>
  );
}
