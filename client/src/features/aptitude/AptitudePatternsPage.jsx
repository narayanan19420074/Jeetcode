import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Typography, CircularProgress, Alert, Chip, Stack, useMediaQuery } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import Alien3D from './components/Alien3D';
import { CountUp, XpBar } from './components/MotionBits';
import HeroPanel from './components/HeroPanel';
import RoadMap from './components/RoadMap';
import { ALIENS, rankForPath, starsFor } from './components/gamification';
import { fetchPatterns } from './aptitudeSlice';

export default function AptitudePatternsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patterns, patternsStatus, error } = useSelector((s) => s.aptitude);
  const phone = useMediaQuery((t) => t.breakpoints.down('sm'));

  useEffect(() => {
    dispatch(fetchPatterns());
  }, [dispatch]);

  const currentIndex = useMemo(() => {
    if (patterns.length === 0) return 0;
    const idx = patterns.findIndex((p) => p.progress.unlocked && p.progress.bestScore < p.passPercentage);
    return idx === -1 ? patterns.length - 1 : idx;
  }, [patterns]);

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
        <RoadMap patterns={patterns} currentIndex={currentIndex} alienKind={rank.alien.key} onOpen={(pattern) => navigate(`/aptitude/${pattern.slug}`)} />
      )}
    </Container>
  );
}
