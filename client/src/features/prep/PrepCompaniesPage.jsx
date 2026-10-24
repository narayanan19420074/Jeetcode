import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Box, ButtonBase, CircularProgress, Container, IconButton, InputAdornment, TextField, Typography, alpha, useMediaQuery, useTheme } from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { prepApi } from '../../api/prepApi';
import { problemsApi } from '../../api/problemsApi';
import CompanyAvatar from '../../components/CompanyAvatar';
import CompanyQuestRoadmap from './CompanyQuestRoadmap';
import useViewportFill from '../dashboard/useViewportFill';

const PAGE = 24;
const norm = (s) => String(s || '').trim().toLowerCase();

const readinessColor = (pct) => (pct < 40 ? '#EF4444' : pct < 70 ? '#F59E0B' : '#10B981');

function CompanyRow({ c, onOpen }) {
  const ready = c.readiness !== null && c.readiness !== undefined;
  return (
    <ButtonBase
      onClick={onOpen} aria-label={`Open ${c.name}`}
      sx={(t) => ({
        display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', p: 1.5, borderRadius: '14px', textAlign: 'left', fontFamily: 'inherit',
        border: `1px solid ${t.palette.divider}`, bgcolor: t.palette.background.paper, transition: 'transform .15s, border-color .15s, box-shadow .15s',
        '&:hover': { transform: 'translateY(-2px)', borderColor: alpha(t.palette.primary.main, 0.6), boxShadow: `0 10px 24px -16px ${alpha(t.palette.primary.main, 0.7)}` },
      })}
    >
      <CompanyAvatar name={c.name} logoUrl={c.logoUrl} size={46} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 800, fontSize: 15 }}>{c.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
          {c.roadmap ? (
            <>
              {c.minutes && <AccessTimeRoundedIcon sx={{ fontSize: 13 }} />}
              <Typography noWrap variant="caption">{[c.minutes && `${c.minutes} min`, `${c.sections} sections`].filter(Boolean).join(' · ')}</Typography>
            </>
          ) : (
            <Typography noWrap variant="caption">{c.count} {c.count === 1 ? 'question' : 'questions'}</Typography>
          )}
        </Box>
        {ready && (
          <Box sx={(t) => ({ mt: 0.6, height: 4, borderRadius: 99, bgcolor: alpha(t.palette.text.primary, 0.09), overflow: 'hidden' })}>
            <Box sx={{ width: `${Math.max(c.readiness, 3)}%`, height: '100%', borderRadius: 99, bgcolor: readinessColor(c.readiness) }} />
          </Box>
        )}
      </Box>
      {ready && c.readiness > 0 ? (
        <Typography sx={{ fontWeight: 800, fontSize: 13, color: readinessColor(c.readiness), fontVariantNumeric: 'tabular-nums' }}>{c.readiness}%</Typography>
      ) : c.roadmap ? (
        <Box sx={{ px: 1, py: 0.2, borderRadius: 99, fontSize: 11, fontWeight: 800, bgcolor: (t) => alpha(t.palette.primary.main, 0.12), color: 'primary.main' }}>Roadmap</Box>
      ) : null}
      <ChevronRightRoundedIcon sx={{ fontSize: 20, color: 'text.disabled', flexShrink: 0 }} />
    </ButtonBase>
  );
}

// Companies: companies with a full exam-pattern roadmap come first, then every other company we have
// questions for. One list, infinite scroll. On wide screens the page is one window tall (the list scrolls
// by itself). Tapping a company opens its question roadmap right here, no page change.
export default function PrepCompaniesPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [sp, setSp] = useSearchParams();
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const sentinel = useRef(null);
  const fillH = useViewportFill(rootRef, isLg);

  const [tracks, setTracks] = useState(null); // null while loading
  const [others, setOthers] = useState(null); // [{ company, count }]
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE);

  useEffect(() => {
    prepApi.listCompanies().then(({ data }) => setTracks(data.data.items || [])).catch(() => setTracks([]));
    problemsApi.getCompanies().then(({ data }) => setOthers(data.data.items || [])).catch(() => setOthers([]));
  }, []);

  const loading = tracks === null || others === null;
  const selectedName = sp.get('company'); // the open company lives in the URL so the phone's back button closes its roadmap
  const q = norm(query);

  const list = useMemo(() => {
    const t = tracks || [];
    const trackNames = new Set(t.map((x) => norm(x.name)));
    const first = t.map((x) => ({ key: `t-${x.slug}`, name: x.name, logoUrl: x.logoUrl, roadmap: true, minutes: x.examDurationMinutes, sections: x.sectionCount, readiness: x.readiness, examSlug: x.slug }));
    const rest = (others || [])
      .filter((c) => !trackNames.has(norm(c.company)))
      .sort((a, b) => b.count - a.count || a.company.localeCompare(b.company))
      .map((c) => ({ key: `c-${c.company}`, name: c.company, count: c.count }));
    return [...first, ...rest].filter((c) => !q || norm(c.name).includes(q));
  }, [tracks, others, q]);

  useEffect(() => setVisible(PAGE), [q]);

  // Infinite scroll: load the next page when the end of the list comes into view (of the list's own scroller on wide screens).
  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible((v) => v + PAGE), { root: fillH ? scrollRef.current : null, rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, [list.length, visible, loading, fillH, selectedName]);

  const shown = list.slice(0, visible);

  const selected = useMemo(() => {
    if (!selectedName) return null;
    const hit = list.find((c) => norm(c.name) === norm(selectedName)) || (tracks || []).map((x) => ({ name: x.name, logoUrl: x.logoUrl, examSlug: x.slug })).find((c) => norm(c.name) === norm(selectedName));
    return hit || { name: selectedName };
  }, [selectedName, list, tracks]);
  const openCompany = (c) => setSp({ company: c.name });
  const closeCompany = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else setSp({}, { replace: true });
  };
  useEffect(() => {
    if (selected) window.scrollTo?.(0, 0);
    if (selected && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [selected?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box ref={rootRef} sx={fillH ? { height: fillH, overflow: 'hidden' } : undefined}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 3 }, height: fillH ? '100%' : 'auto' }}>
        <Box
          sx={{
            display: 'grid', gap: 2.5, alignItems: 'start', height: fillH ? '100%' : 'auto',
            gridTemplateColumns: 'minmax(0,1fr)',
            gridTemplateRows: fillH ? 'minmax(0, 1fr)' : undefined,
          }}
        >
          {/* list (stays mounted so search and scroll survive opening a company) */}
          <Box sx={{ minWidth: 0, minHeight: 0, height: fillH ? '100%' : 'auto', display: selected ? 'none' : 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mb: 2, flexShrink: 0 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.01em' }}>Companies</Typography>
                <Typography variant="body2" color="text.secondary">Pick a company to play through its questions, level by level.</Typography>
              </Box>
              <TextField
                size="small" placeholder="Search companies" value={query} onChange={(e) => setQuery(e.target.value)}
                sx={{ width: { xs: '100%', sm: 260 }, flexShrink: 0 }}
                slotProps={{
                  input: {
                    sx: { borderRadius: 99 },
                    startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment>,
                    endAdornment: query ? (
                      <InputAdornment position="end">
                        <IconButton size="small" aria-label="Clear search" onClick={() => setQuery('')}><ClearRoundedIcon fontSize="small" /></IconButton>
                      </InputAdornment>
                    ) : null,
                  },
                  htmlInput: { 'aria-label': 'Search companies' },
                }}
              />
            </Box>

            <Box ref={scrollRef} className="autohide-scroll" sx={fillH ? { flex: 1, minHeight: 0, overflowY: 'auto', pr: 1, scrollbarGutter: 'stable' } : undefined}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>
              ) : shown.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>{query ? `No company matches “${query}”.` : 'No companies yet.'}</Typography>
              ) : (
                <>
                  <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))' } }}>
                    {shown.map((c) => <CompanyRow key={c.key} c={c} onOpen={() => openCompany(c)} />)}
                  </Box>
                  <Box ref={sentinel} sx={{ height: 1 }} />
                  {visible < list.length && <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={22} /></Box>}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, mb: 1, textAlign: 'center' }}>
                    Company names and logos belong to their owners and are shown only to identify each company.
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          <AnimatePresence>
            {selected && (
              <motion.div
                key={selected.name}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className="autohide-scroll"
                style={fillH ? { height: '100%', overflowY: 'auto', overflowX: 'hidden', minHeight: 0 } : undefined}
              >
                <CompanyQuestRoadmap company={selected} onBack={closeCompany} />
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Container>
    </Box>
  );
}
