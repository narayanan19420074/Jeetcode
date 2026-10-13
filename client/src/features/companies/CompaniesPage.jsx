import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Container, IconButton, InputAdornment, Skeleton, Stack, TextField, Typography, alpha } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { problemsApi } from '../../api/problemsApi';
import { prepApi } from '../../api/prepApi';
import CompanyAvatar from '../../components/CompanyAvatar';

const PAGE = 40;
const norm = (s) => String(s || '').trim().toLowerCase();

const SORTS = [
  { key: 'count', label: 'Most questions' },
  { key: 'name', label: 'A – Z' },
];

function RowSkeleton() {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', py: 1.5 }}>
      <Skeleton variant="rounded" width={52} height={52} />
      <Box sx={{ flex: 1 }}>
        <Skeleton width="45%" />
        <Skeleton width="30%" />
      </Box>
    </Stack>
  );
}

// "Companies" tab: every company that has questions, with its logo and question
// count. Tapping one opens the problem list already filtered to that company.
export default function CompaniesPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState(null); // [{ company, count }]
  const [tracks, setTracks] = useState([]); // prep tracks (have logo + readiness)
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('count');
  const [visible, setVisible] = useState(PAGE);
  const sentinel = useRef(null);

  const load = useCallback(() => {
    setError(false);
    setCompanies(null);
    problemsApi
      .getCompanies()
      .then(({ data }) => setCompanies(data.data.items || []))
      .catch(() => setError(true));
    // Prep tracks are optional: they only add logos and the "Prep track" shortcut.
    prepApi
      .listCompanies()
      .then(({ data }) => setTracks(data.data.items || []))
      .catch(() => {});
  }, []);

  useEffect(load, [load]);

  const trackByName = useMemo(() => new Map(tracks.map((t) => [norm(t.name), t])), [tracks]);

  const list = useMemo(() => {
    const q = norm(query);
    const rows = (companies || []).filter((c) => !q || norm(c.company).includes(q));
    rows.sort((a, b) => (sort === 'name' ? a.company.localeCompare(b.company) : b.count - a.count || a.company.localeCompare(b.company)));
    return rows;
  }, [companies, query, sort]);

  // Reset paging whenever the list changes shape.
  useEffect(() => setVisible(PAGE), [query, sort, companies]);

  // Load more rows as the user nears the bottom.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible((v) => v + PAGE), { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [list.length, visible]);

  const open = (name) => navigate(`/problems?company=${encodeURIComponent(name)}`);

  return (
    <Container maxWidth="sm" sx={{ pt: { xs: 2, sm: 4 }, pb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
        Companies
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        {companies ? `${companies.length} companies · pick one to practise its questions` : 'Pick a company to practise its questions'}
      </Typography>

      <TextField
        fullWidth
        placeholder="Search companies"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        slotProps={{
          input: {
            sx: { borderRadius: 99 },
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton size="small" aria-label="Clear search" onClick={() => setQuery('')}>
                  <ClearRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
          htmlInput: { 'aria-label': 'Search companies' },
        }}
      />

      {/* Prep tracks: the companies we have a full exam-pattern roadmap for */}
      {tracks.length > 0 && !query && (
        <Box sx={{ mt: 2.5 }}>
          <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontWeight: 800 }}>Prep tracks</Typography>
            <Button component={RouterLink} to="/prep" size="small" sx={{ fontWeight: 700 }}>
              See all
            </Button>
          </Stack>
          <Box sx={{ display: 'flex', gap: 1.25, overflowX: 'auto', pb: 0.5, mx: -2, px: 2, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            {tracks.map((t) => (
              <Box
                key={t.slug}
                component={RouterLink}
                to={`/prep/${t.slug}`}
                sx={(th) => ({
                  flexShrink: 0,
                  width: 128,
                  p: 1.5,
                  borderRadius: '20px',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  bgcolor: alpha(th.palette.primary.main, th.palette.mode === 'dark' ? 0.16 : 0.1),
                })}
              >
                <CompanyAvatar name={t.name} logoUrl={t.logoUrl} size={40} />
                <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
                  {t.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t.readiness === null ? `${t.sectionCount} sections` : `${t.readiness}% ready`}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 2.5, mb: 0.5 }}>
        {SORTS.map((s) => (
          <Chip
            key={s.key}
            label={s.label}
            onClick={() => setSort(s.key)}
            color={sort === s.key ? 'primary' : 'default'}
            variant={sort === s.key ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700 }}
          />
        ))}
      </Stack>

      {error && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography sx={{ fontWeight: 700 }}>Couldn’t load companies</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Check your connection and try again.
          </Typography>
          <Button variant="contained" disableElevation onClick={load}>
            Retry
          </Button>
        </Box>
      )}

      {!error && companies === null && Array.from({ length: 8 }, (_, i) => <RowSkeleton key={i} />)}

      {!error && companies && list.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
          {query ? `No company matches “${query}”.` : 'No companies yet.'}
        </Typography>
      )}

      {!error && companies && list.length > 0 && (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {list.slice(0, visible).map((c) => {
            const track = trackByName.get(norm(c.company));
            return (
              <Box component="li" key={c.company}>
                <Box
                  component="button"
                  type="button"
                  onClick={() => open(c.company)}
                  sx={{
                    all: 'unset',
                    boxSizing: 'border-box',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2, borderRadius: '12px' },
                    '&:active': { bgcolor: 'action.hover' },
                  }}
                >
                  <CompanyAvatar name={c.company} logoUrl={track?.logoUrl} size={52} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography noWrap sx={{ fontWeight: 600, fontSize: '1.02rem' }}>
                      {c.company}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {c.count.toLocaleString('en-IN')} {c.count === 1 ? 'Question' : 'Questions'}
                      {track ? ' · Prep track' : ''}
                    </Typography>
                  </Box>
                  <ChevronRightRoundedIcon sx={{ color: 'text.disabled' }} />
                </Box>
              </Box>
            );
          })}
          {visible < list.length && <Box ref={sentinel} sx={{ height: 1 }} />}
        </Box>
      )}
    </Container>
  );
}
