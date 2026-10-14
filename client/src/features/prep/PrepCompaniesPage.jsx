import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Grid, Paper, CircularProgress, LinearProgress, Chip, InputAdornment, IconButton, TextField } from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { prepApi } from '../../api/prepApi';
import { problemsApi } from '../../api/problemsApi';
import CompanyAvatar from '../../components/CompanyAvatar';

const PAGE = 45;
const norm = (s) => String(s || '').trim().toLowerCase();

const readinessColor = (pct) => {
  if (pct === null) return 'primary.main';
  if (pct < 40) return 'error.main';
  if (pct < 70) return 'warning.main';
  return 'success.main';
};

const cardSx = {
  p: 3,
  borderRadius: 3,
  cursor: 'pointer',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  transition: 'all 0.15s ease',
  '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
};

// Prep by Company: the companies with a full exam-pattern roadmap come first,
// then every other company we have questions for — all in one place.
export default function PrepCompaniesPage() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [others, setOthers] = useState([]); // [{ company, count }]
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE);
  const sentinel = useRef(null);

  useEffect(() => {
    const prep = prepApi
      .listCompanies()
      .then(({ data }) => setTracks(data.data.items || []))
      .catch(() => {});
    const all = problemsApi
      .getCompanies()
      .then(({ data }) => setOthers(data.data.items || []))
      .catch(() => {});
    Promise.all([prep, all]).finally(() => setLoading(false));
  }, []);

  const q = norm(query);

  const shownTracks = useMemo(() => tracks.filter((t) => !q || norm(t.name).includes(q)), [tracks, q]);

  // Companies that already have a prep track are not repeated below it.
  const shownOthers = useMemo(() => {
    const trackNames = new Set(tracks.map((t) => norm(t.name)));
    return others
      .filter((c) => !trackNames.has(norm(c.company)) && (!q || norm(c.company).includes(q)))
      .sort((a, b) => b.count - a.count || a.company.localeCompare(b.company));
  }, [others, tracks, q]);

  useEffect(() => setVisible(PAGE), [q]);

  // Load more companies as the user nears the bottom.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible((v) => v + PAGE), { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [shownOthers.length, visible, loading]);

  const empty = !loading && shownTracks.length === 0 && shownOthers.length === 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          Prep by Company
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Pick a company — see the exact exam pattern, and exactly how ready you are for it.
        </Typography>
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder="Search companies"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 3, maxWidth: 420 }}
        slotProps={{
          input: {
            sx: { borderRadius: 99 },
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          {shownTracks.length > 0 && (
            <Grid container spacing={3}>
              {shownTracks.map((c) => (
                <Grid key={c.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper variant="outlined" onClick={() => navigate(`/prep/${c.slug}`)} sx={cardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CompanyAvatar name={c.name} logoUrl={c.logoUrl} size={44} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{c.name}</Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                      {c.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {c.examDurationMinutes && (
                        <Chip icon={<AccessTimeRoundedIcon sx={{ fontSize: '0.9rem !important' }} />} label={`${c.examDurationMinutes} min`} size="small" variant="outlined" />
                      )}
                      <Chip label={`${c.sectionCount} sections`} size="small" variant="outlined" />
                    </Box>

                    {c.readiness !== null && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">Readiness</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: readinessColor(c.readiness) }}>{c.readiness}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={c.readiness}
                          sx={{ height: 6, borderRadius: 3, bgcolor: 'action.disabledBackground', '& .MuiLinearProgress-bar': { bgcolor: readinessColor(c.readiness), borderRadius: 3 } }}
                        />
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          {shownOthers.length > 0 && (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', mt: shownTracks.length ? 4 : 0, mb: 1.5 }}>
                All companies
              </Typography>
              <Grid container spacing={2}>
                {shownOthers.slice(0, visible).map((c) => (
                  <Grid key={c.company} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                      variant="outlined"
                      onClick={() => navigate(`/problems?company=${encodeURIComponent(c.company)}`)}
                      sx={{ ...cardSx, p: 2, flexDirection: 'row', alignItems: 'center', gap: 1.5 }}
                    >
                      <CompanyAvatar name={c.company} size={40} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap sx={{ fontWeight: 700 }}>{c.company}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.count} {c.count === 1 ? 'question' : 'questions'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <Box ref={sentinel} sx={{ height: 1 }} />
            </>
          )}

          {empty && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
              {query ? `No company matches “${query}”.` : 'No companies yet.'}
            </Typography>
          )}
        </>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4, textAlign: 'center' }}>
        Company names and logos belong to their owners and are shown only to identify each company.
      </Typography>
    </Container>
  );
}
