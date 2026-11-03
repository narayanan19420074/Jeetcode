import MobileAptitude from '../components/MobileAptitude';

export default function AptitudeMobileView({ page }) {
  const { tracks, track, trackPatterns, cleared, currentIndex, alienKind, trackTheme, loading, error, pickTrack } = page;
  return (
    <MobileAptitude
      tracks={tracks} track={track} trackPatterns={trackPatterns} cleared={cleared} currentIndex={currentIndex}
      alienKind={alienKind} trackTheme={trackTheme} loading={loading} error={error} onPickTrack={pickTrack}
    />
  );
}
