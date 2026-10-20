import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Typography, CircularProgress, Alert, Chip, Stack, Tabs, Tab, useMediaQuery, useTheme } from '@mui/material';
import { ThemeProvider, createTheme, alpha, lighten, darken } from '@mui/material/styles';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import Alien3D from './components/Alien3D';
import { CountUp, XpBar } from './components/MotionBits';
import HeroPanel from './components/HeroPanel';
import RoadMap from './components/RoadMap';
import { ALIENS, rankForPath, starsFor } from './components/gamification';
import { fetchPatterns } from './aptitudeSlice';

// Tracks (tabs). Each one is its own level road with its own START and accent
// colour. `color: null` = the app's primary colour. Keep trackOf() in sync with
// trackOf() in server/src/services/aptitude.service.js.
const TRACKS = [
  { key: 'aptitude', label: 'Aptitude', icon: <CalculateRoundedIcon />, color: null },
  { key: 'reasoning', label: 'Reasoning', icon: <PsychologyRoundedIcon />, color: '#8B5CF6' },
  { key: 'verbal', label: 'Verbal', icon: <MenuBookRoundedIcon />, color: '#EC4899' },
  { key: 'di', label: 'Data Interpretation', icon: <BarChartRoundedIcon />, color: '#F97316' },
];

export function trackOf(category = '') {
  const c = String(category || '').toLowerCase();
  if (/logical|reason/.test(c)) return 'reasoning';
  if (/verbal/.test(c)) return 'verbal';
  if (/data/.test(c)) return 'di';
  return 'aptitude';
}

const isCleared = (p) => p.progress.bestScore >= p.passPercentage;

export default function AptitudePatternsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const outerTheme = useTheme();
  const [params, setParams] = useSearchParams();
  const { patterns, patternsStatus, error } = useSelector((s) => s.aptitude);
  const phone = useMediaQuery((t) => t.breakpoints.down('sm'));

  useEffect(() => {
    dispatch(fetchPatterns());
  }, [dispatch]);

  // Group levels by track. Aptitude is always shown; other tabs only when they have levels.
  const byTrack = useMemo(() => {
    const m = Object.fromEntries(TRACKS.map((t) => [t.key, []]));
    patterns.forEach((p) => m[trackOf(p.category)].push(p));
    return m;
  }, [patterns]);
  const visibleTracks = TRACKS.filter((t) => t.key === 'aptitude' || byTrack[t.key].length > 0);

  const wanted = params.get('track');
  const track = visibleTracks.find((t) => t.key === wanted) || visibleTracks[0];
  const trackPatterns = byTrack[track.key];

  // Once the learner switches tabs they are already at the map: don't auto-scroll again.
  const switched = useRef(false);
  const pickTrack = (key) => {
    switched.current = true;
    setParams(key === 'aptitude' ? {} : { track: key }, { replace: true });
  };

  // Same map, tinted with the tab's colour (current level, pulse, road, START, walker bubble).
  const trackTheme = useMemo(() => {
    if (!track.color) return outerTheme;
    return createTheme(outerTheme, {
      palette: { primary: { main: track.color, light: lighten(track.color, 0.25), dark: darken(track.color, 0.2), contrastText: '#fff' } },
    });
  }, [outerTheme, track.color]);

  // Current level inside the selected track.
  const currentIndex = useMemo(() => {
    if (trackPatterns.length === 0) return 0;
    const idx = trackPatterns.findIndex((p) => p.progress.unlocked && !isCleared(p));
    return idx === -1 ? trackPatterns.length - 1 : idx;
  }, [trackPatterns]);

  const cleared = patterns.filter((p) => p.progress.bestScore >= p.passPercentage).length;
  const rank = rankForPath(cleared, patterns.length);
  const totalStars = patterns.reduce((n, p) => n + starsFor(p.progress.bestScore, p.passPercentage), 0);
  const pathPct = patterns.length ? (cleared / patterns.length) * 100 : 0;

  return (
    <Container maxWidth="md" disableGutters sx={{ px: { xs: 0, sm: 3 }, py: { xs: 1.5, sm: 4 } }}>
      <HeroPanel glow={rank.alien.glow ? `#${rank.alien.glow.replace('#', '')}` : '#3B82F6'} sx={{ mb: { xs: 1.5, sm: 3 }, mx: { xs: 1.5, sm: 0 }, p: { xs: 1.5, md: 4 } }}>
        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ position: 'relative', alignItems: 'center' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Chip size="small" variant="outlined" color="primary" icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} />} label="Placement path" sx={{ fontWeight: 700, mb: 1.5, display: { xs: 'none', sm: 'inline-flex' } }} />
            <Typography component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, fontSize: { xs: 22, md: 48 } }}>
              The One for <Box component="span" sx={{ color: 'primary.main' }}>All</Box> Aptitude
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.25, maxWidth: 460, display: { xs: 'none', sm: 'block' } }}>
              Learn it. Drill it. Beat the clock. Clear each level in Test mode to unlock the next and evolve your alien.
            </Typography>

            <Stack direction="row" spacing={0} sx={{ mt: { xs: 1.25, sm: 3 }, flexWrap: 'wrap', rowGap: { xs: 1, sm: 2 } }} divider={<Box sx={{ width: '1px', bgcolor: 'divider', mx: { xs: 2, sm: 3 } }} />}>
              {[
                [cleared, 'Levels cleared', `/${patterns.length}`],
                [totalStars, 'Stars', `/${patterns.length * 3}`],
              ].map(([v, k, suf]) => (
                <Box key={k}>
                  <Typography sx={{ fontWeight: 800, fontSize: { xs: 18, sm: 28 }, lineHeight: 1, fontFamily: '"JetBrains Mono", monospace' }}>
                    <CountUp value={v} />
                    <Box component="span" sx={{ fontSize: 14, color: 'text.secondary', fontWeight: 700 }}>
                      {suf}
                    </Box>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    {k}
                  </Typography>
                </Box>
              ))}
              <Box sx={{ minWidth: 160, flex: 1, maxWidth: 240, alignSelf: 'flex-end' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Rank · <Box component="span" sx={{ color: 'text.primary' }}>{rank.alien.name} the {rank.alien.title}</Box>
                </Typography>
                <Box sx={{ mt: 0.75 }}>
                  <XpBar pct={pathPct} color={rank.alien.color} height={8} track="rgba(148,163,184,.22)" />
                </Box>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ position: 'relative', flexShrink: 0, textAlign: 'center' }}>
            <Alien3D kind={rank.alien.key} size={phone ? 76 : 200} wave spin />
            <Stack direction="row" spacing={0.75} sx={{ justifyContent: 'center', mt: 0.5, display: { xs: 'none', sm: 'flex' } }}>
              {ALIENS.map((a, i) => (
                <Box key={a.key} title={a.name} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: i <= rank.index ? a.color : 'action.disabledBackground', boxShadow: i === rank.index ? `0 0 10px ${a.color}` : 'none' }} />
              ))}
            </Stack>
          </Box>
        </Stack>
      </HeroPanel>

      {error && (
        <Alert severity="error" sx={{ mb: 2, mx: { xs: 1.5, sm: 0 } }}>
          {error}
        </Alert>
      )}

      {patternsStatus === 'loading' ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          {/* Track tabs */}
          <Tabs
            value={track.key}
            onChange={(_, v) => pickTrack(v)}
            variant="scrollable"
            scrollButtons={false}
            slotProps={{ indicator: { sx: { display: 'none' } } }}
            sx={{ minHeight: 0, mx: { xs: 1.5, sm: 0 }, mb: 1.5, '& .MuiTabs-flexContainer': { gap: 0.75 } }}
          >
            {visibleTracks.map((t) => {
              const list = byTrack[t.key];
              const color = t.color || outerTheme.palette.primary.main;
              const done = list.filter(isCleared).length;
              return (
                <Tab
                  key={t.key}
                  value={t.key}
                  icon={t.icon}
                  iconPosition="start"
                  label={
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
                      {t.label}
                      <Box component="span" sx={{ fontSize: 11, fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', opacity: 0.8 }}>
                        {done}/{list.length}
                      </Box>
                    </Stack>
                  }
                  sx={{
                    minHeight: 42,
                    px: 1.75,
                    py: 0,
                    gap: 0.5,
                    borderRadius: 999,
                    textTransform: 'none',
                    fontWeight: 700,
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                    '& svg': { fontSize: 20, mr: '0 !important', mb: '0 !important', color },
                    '&.Mui-selected': { color, borderColor: alpha(color, 0.6), bgcolor: alpha(color, 0.12) },
                  }}
                />
              );
            })}
          </Tabs>

          <ThemeProvider theme={trackTheme}>
            {trackPatterns.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
                No levels in this track yet.
              </Typography>
            ) : (
              <RoadMap
                key={track.key}
                patterns={trackPatterns}
                currentIndex={currentIndex}
                alienKind={rank.alien.key}
                autoScroll={!switched.current}
                onOpen={(pattern) => navigate(`/aptitude/${pattern.slug}`)}
              />
            )}
          </ThemeProvider>
        </>
      )}
    </Container>
  );
}
