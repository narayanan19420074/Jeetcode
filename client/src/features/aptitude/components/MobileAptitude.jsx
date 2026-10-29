import { cloneElement } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Alert, Box, Button, ButtonBase, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { ThemeProvider, alpha } from '@mui/material/styles';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { tint } from '../../dashboard/dashboardUtils';
import { HeaderTile, LibraryFont, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import RoadMap from './RoadMap';

// Phone layout of the Aptitude page. It follows the phone Problems page: same page padding, back button,
// centred header, progress bar, pill button and type sizes. The level map climbs from the bottom to the top.

export default function MobileAptitude({ tracks, track, trackPatterns, cleared, currentIndex, alienKind, trackTheme, loading, error, onPickTrack }) {
  const navigate = useNavigate();
  const pal = useLibraryPalette();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const accent = track.color;
  const total = trackPatterns.length;
  const current = trackPatterns[currentIndex];
  const actionLabel = cleared === 0 ? 'Start' : cleared >= total ? 'Review' : 'Continue';

  return (
    <LibraryFont>
    <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>
      <IconButton component={RouterLink} to={isAuthenticated ? '/dashboard' : '/'} aria-label="Back to dashboard" sx={{ width: 44, height: 44, ml: -1, color: pal.text }}>
        <ArrowBackRoundedIcon />
      </IconButton>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mt: 1.5 }}>
        <HeaderTile>{cloneElement(track.icon, { sx: { fontSize: 28 } })}</HeaderTile>
        <Typography component="h1" noWrap sx={{ mt: 1.5, fontWeight: 700, fontSize: 26, lineHeight: '32px' }}>
          {track.label}
        </Typography>
        <Typography sx={{ fontSize: 17, lineHeight: '24px', letterSpacing: '0.03em', color: pal.muted }}>Placement preparation</Typography>

        {!loading && total > 0 && (
          <>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', justifyContent: 'center', mt: 2.5 }}>
              <Box
                role="progressbar"
                aria-label="Levels cleared"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={cleared}
                sx={{ width: 162, height: 8, borderRadius: 99, bgcolor: tint('#F2B63C', 28), overflow: 'hidden' }}
              >
                <Box sx={{ width: `${Math.min((cleared / total) * 100, 100)}%`, height: '100%', borderRadius: 99, bgcolor: '#F2B63C', transition: 'width .5s' }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 20, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                {cleared}
                <Box component="span" sx={{ color: pal.muted, fontWeight: 400 }}>
                  /{total}
                </Box>
              </Typography>
            </Stack>

            <Stack direction="row" sx={{ justifyContent: 'center', mt: 2.5 }}>
              <Button
                onClick={() => current && navigate(`/aptitude/${current.slug}`)}
                disableElevation
                variant="contained"
                startIcon={<PlayArrowRoundedIcon />}
                sx={(t) => ({ height: 40, minWidth: 152, px: 3, borderRadius: 999, fontWeight: 500, fontSize: 18, letterSpacing: '0.03em', textTransform: 'none', bgcolor: pal.player, color: t.palette.mode === 'dark' ? pal.text : '#6B4A1E', '&:hover': { bgcolor: pal.player, filter: 'brightness(0.97)' } })}
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
            mx: -2,
            px: 2,
            pt: 'calc(8px + env(safe-area-inset-top))',
            pb: 1,
            mt: 1.5,
            bgcolor: alpha(pal.bg, 0.94),
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
                  <Typography noWrap sx={{ maxWidth: '100%', fontWeight: 500, fontSize: 13, lineHeight: 1.2, letterSpacing: '0.03em' }}>
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
            <LibraryFont>
              <RoadMap
                key={track.key}
                compact
                patterns={trackPatterns}
                currentIndex={currentIndex}
                alienKind={alienKind}
                onOpen={(pattern) => navigate(`/aptitude/${pattern.slug}`)}
              />
            </LibraryFont>
          </ThemeProvider>
        )}
      </Box>
    </Box>
    </LibraryFont>
  );
}
