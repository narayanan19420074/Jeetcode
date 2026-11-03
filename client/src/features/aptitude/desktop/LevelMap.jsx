import { useNavigate } from 'react-router-dom';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { LibraryFont } from '../../dashboard/components/libraryStyle';
import RoadMap from '../components/RoadMap';

// The level road in the open track's colour. The compact map climbs from START at the bottom to the last level at the top.
export default function LevelMap({ page }) {
  const navigate = useNavigate();
  const { loading, error, track, trackPatterns, currentIndex, alienKind, trackTheme } = page;
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>;
  return (
    <Box sx={{ maxWidth: 640, width: '100%', mx: 'auto' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {trackPatterns.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>No levels in this section yet.</Typography>
      ) : (
        <ThemeProvider theme={trackTheme}>
          <LibraryFont>
            <RoadMap key={track.key} compact patterns={trackPatterns} currentIndex={currentIndex} alienKind={alienKind} onOpen={(pattern) => navigate(`/aptitude/${pattern.slug}`)} />
          </LibraryFont>
        </ThemeProvider>
      )}
    </Box>
  );
}
