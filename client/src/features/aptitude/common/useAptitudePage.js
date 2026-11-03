import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createTheme, darken, lighten, useTheme } from '@mui/material/styles';
import { rankForPath } from '../components/gamification';
import { fetchPatterns } from '../aptitudeSlice';
import { TRACKS, isCleared, trackOf } from './aptitudeTracks';

// Aptitude is always shown; the other tracks only when they have levels. The open track lives in ?track=.
function useTrackSelection(patterns) {
  const [params, setParams] = useSearchParams();
  const byTrack = useMemo(() => {
    const groups = Object.fromEntries(TRACKS.map((track) => [track.key, []]));
    patterns.forEach((pattern) => groups[trackOf(pattern.category)].push(pattern));
    return groups;
  }, [patterns]);
  const visibleTracks = TRACKS.filter((track) => track.key === 'aptitude' || byTrack[track.key].length > 0);
  const track = visibleTracks.find((item) => item.key === params.get('track')) || visibleTracks[0];
  const pickTrack = (key) => setParams(key === 'aptitude' ? {} : { track: key }, { replace: true });
  return { visibleTracks, track, trackPatterns: byTrack[track.key], pickTrack };
}

// The same map, tinted with the tab's colour (current level, pulse, road, START, walker bubble).
function useTrackTheme(track) {
  const outerTheme = useTheme();
  return useMemo(() => {
    if (!track.color) return outerTheme;
    const palette = { primary: { main: track.color, light: lighten(track.color, 0.25), dark: darken(track.color, 0.2), contrastText: '#fff' } };
    return createTheme(outerTheme, { palette });
  }, [outerTheme, track.color]);
}

// The first unlocked level that is not cleared yet, or the last level when the whole track is done.
function useCurrentLevel(trackPatterns) {
  return useMemo(() => {
    if (trackPatterns.length === 0) return 0;
    const index = trackPatterns.findIndex((pattern) => pattern.progress.unlocked && !isCleared(pattern));
    return index === -1 ? trackPatterns.length - 1 : index;
  }, [trackPatterns]);
}

// Everything the Aptitude page needs, shared by the phone and desktop layouts.
export default function useAptitudePage() {
  const dispatch = useDispatch();
  const accent = useTheme().palette.primary.main;
  const { patterns, patternsStatus, error } = useSelector((state) => state.aptitude);
  useEffect(() => { dispatch(fetchPatterns()); }, [dispatch]);

  const { visibleTracks, track, trackPatterns, pickTrack } = useTrackSelection(patterns);
  const trackTheme = useTrackTheme(track);
  const currentIndex = useCurrentLevel(trackPatterns);
  const rank = rankForPath(patterns.filter(isCleared).length, patterns.length);
  const withAccent = (item) => ({ ...item, color: item.color || accent });

  return {
    tracks: visibleTracks.map(withAccent), track: withAccent(track), trackPatterns, pickTrack, trackTheme, currentIndex,
    cleared: trackPatterns.filter(isCleared).length, alienKind: rank.alien.key, loading: patternsStatus === 'loading', error,
  };
}
