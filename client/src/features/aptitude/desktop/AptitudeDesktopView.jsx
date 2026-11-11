import { Box } from '@mui/material';
import BackToDashboard from '../../../components/BackToDashboard';
import DesktopPageFrame from '../../../components/DesktopPageFrame';
import { LibraryFont } from '../../dashboard/components/libraryStyle';
import AptitudeSummary from './AptitudeSummary';
import LevelMap from './LevelMap';
import TrackPicker from './TrackPicker';

function LeftColumn({ page }) {
  return (
    <Box sx={{ display: 'grid', gap: 3, justifyItems: 'stretch' }}>
      <Box><BackToDashboard /></Box>
      <AptitudeSummary track={page.track} trackPatterns={page.trackPatterns} cleared={page.cleared} currentIndex={page.currentIndex} loading={page.loading} />
      <TrackPicker tracks={page.tracks} track={page.track} onPick={page.pickTrack} />
    </Box>
  );
}

// Desktop Aptitude in the Library look, in the shared page frame (same margins and column widths as the Dashboard):
// the open section's summary and picker stay on the left while the level road scrolls in the middle.
export default function AptitudeDesktopView({ page }) {
  return (
    <LibraryFont>
      <DesktopPageFrame left={<LeftColumn page={page} />}>
        <LevelMap page={page} />
      </DesktopPageFrame>
    </LibraryFont>
  );
}
