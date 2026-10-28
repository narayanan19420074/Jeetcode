import { cloneElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, ButtonBase, CircularProgress, Stack, Typography } from '@mui/material';
import { ThemeProvider, alpha } from '@mui/material/styles';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import BackToDashboard from '../../../components/BackToDashboard';
import { tint } from '../../dashboard/dashboardUtils';
import RoadMap from './RoadMap';

// Phone layout of the Aptitude page. It follows the phone Problems page: same page padding, back button,
// centred header, progress bar, pill button and type sizes. The level map climbs from the bottom to the top.

export default function MobileAptitude({ tracks, track, trackPatterns, cleared, currentIndex, alienKind, trackTheme, loading, error, onPickTrack }) {
  const navigate = useNavigate();
  const accent = track.color;
  const total = trackPatterns.length;
  const current = trackPatterns[currentIndex];
  const actionLabel = cleared === 0 ? 'Start' : cleared >= total ? 'Review' : 'Continue';

  return (
    <Box sx={{ px: 1.75, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>
      <BackToDashboard sx={{ width: 44, height: 44, border: 'none', bgcolor: 'transparent' }} />

      {/* Header */}
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Box
          sx={{
            width: 84,
            height: 84,
            mx: 'auto',
            borderRadius: '26px',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 60%, #000))`,
            boxShadow: `0 14px 26px -12px ${accent}`,
          }}
        >
          {cloneElement(track.icon, { sx: { fontSize: 44 } })}
        </Box>
        <Typography component="h1" noWrap sx={{ mt: 1.75, fontWeight: 800, fontSize: '1.9rem', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
          {track.label}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1rem', mt: 0.25 }}>
          Placement preparation
        </Typography>

        {!loading && total > 0 && (
          <>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center', mt: 2 }}>
              <Box
                role="progressbar"
                aria-label="Levels cleared"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={cleared}
                sx={{ flex: 1, maxWidth: 260, height: 8, borderRadius: 99, bgcolor: tint(accent, 20), overflow: 'hidden' }}
              >
                <Box sx={{ width: `${Math.min((cleared / total) * 100, 100)}%`, height: '100%', borderRadius: 99, bgcolor: accent, transition: 'width .5s' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                {cleared}
                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  /{total}
                </Box>
              </Typography>
            </Stack>

            <Stack direction="row" sx={{ justifyContent: 'center', mt: 2 }}>
              <Button
                onClick={() => current && navigate(`/aptitude/${current.slug}`)}
                disableElevation
                variant="contained"
                startIcon={<PlayArrowRoundedIcon />}
                sx={{ height: 48, px: 3.5, borderRadius: 999, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: tint(accent, 20), color: accent, '&:hover': { bgcolor: tint(accent, 30) } }}
              >
                {actionLabel}
              </Button>
            </Stack>
          </>
        )}
      </Box>

      {/* Section picker: icons only need a tap. It stays at the top while the map scrolls. */}
      {tracks.length > 1 && (
        <Box
          sx={(t) => ({
            position: 'sticky',
            top: 0,
            zIndex: 10,
            mx: -1.75,
            px: 1.75,
            pt: 'calc(8px + env(safe-area-inset-top))',
            pb: 1,
            mt: 1.5,
            bgcolor: alpha(t.palette.background.default, 0.94),
            backdropFilter: 'blur(8px)',
          })}
        >
          <Box role="group" aria-label="Aptitude sections" sx={{ display: 'grid', gridTemplateColumns: `repeat(${tracks.length}, 1fr)`, gap: 0.75 }}>
            {tracks.map((t) => {
              const selected = t.key === track.key;
              return (
                <ButtonBase
                  key={t.key}
                  onClick={() => onPickTrack(t.key)}
                  aria-label={t.label}
                  aria-pressed={selected}
                  sx={{
                    minWidth: 0,
                    flexDirection: 'column',
                    gap: 0.5,
                    py: 1,
                    px: 0.5,
                    borderRadius: '20px',
                    fontFamily: 'inherit',
                    color: selected ? t.color : 'text.secondary',
                    bgcolor: selected ? tint(t.color, 14) : 'transparent',
                    border: `1px solid ${selected ? tint(t.color, 40) : 'transparent'}`,
                  }}
                >
                  <Box sx={{ width: 44, height: 44, borderRadius: '15px', display: 'grid', placeItems: 'center', bgcolor: tint(t.color, selected ? 24 : 12), color: t.color }}>
                    {cloneElement(t.icon, { sx: { fontSize: 26 } })}
                  </Box>
                  <Typography noWrap sx={{ maxWidth: '100%', fontWeight: 700, fontSize: '0.82rem', lineHeight: 1.2 }}>
                    {t.short}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Level map */}
      <Box sx={{ mt: 1.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : total === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
            No levels in this section yet.
          </Typography>
        ) : (
          <ThemeProvider theme={trackTheme}>
            <RoadMap
              key={track.key}
              compact
              patterns={trackPatterns}
              currentIndex={currentIndex}
              alienKind={alienKind}
              onOpen={(pattern) => navigate(`/aptitude/${pattern.slug}`)}
            />
          </ThemeProvider>
        )}
      </Box>
    </Box>
  );
}
