import { Box, Container } from '@mui/material';
import BackToDashboard from '../../../components/BackToDashboard';
import { LibraryFont } from '../../dashboard/components/libraryStyle';
import AptitudeSummary from './AptitudeSummary';
import LevelMap from './LevelMap';
import TrackPicker from './TrackPicker';

const SIDE_WIDTH = 300;
const NAVBAR_OFFSET = 88;

// Desktop Aptitude in the Library look: the open section's summary and picker stay on the left while the level road scrolls on the right.
export default function AptitudeDesktopView({ page }) {
  return (
    <LibraryFont>
      <Container maxWidth={false} sx={{ maxWidth: 1080, py: 3, px: 3 }}>
        <Box sx={{ display: 'grid', gap: 5, alignItems: 'start', gridTemplateColumns: `${SIDE_WIDTH}px minmax(0, 1fr)` }}>
          <Box sx={{ position: 'sticky', top: NAVBAR_OFFSET, display: 'grid', gap: 3, justifyItems: 'stretch' }}>
            <Box><BackToDashboard /></Box>
            <AptitudeSummary track={page.track} trackPatterns={page.trackPatterns} cleared={page.cleared} currentIndex={page.currentIndex} loading={page.loading} />
            <TrackPicker tracks={page.tracks} track={page.track} onPick={page.pickTrack} />
          </Box>
          <LevelMap page={page} />
        </Box>
      </Container>
    </LibraryFont>
  );
}
