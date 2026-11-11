import { useNavigate } from 'react-router-dom';
import { Box, ButtonBase, LinearProgress, Skeleton, Stack, Typography } from '@mui/material';
import AppCard from '../../../components/ui/AppCard';
import CompanyAvatar from '../../../components/CompanyAvatar';
import RailCardTitle from './RailCardTitle';
import { LIB_ACCENT } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const TRACKS_SHOWN = 4;

// Only tracks the learner has started, furthest along first.
const startedTracks = (tracks) => tracks.filter((track) => track.readiness > 0).sort((first, second) => second.readiness - first.readiness).slice(0, TRACKS_SHOWN);

const barSx = { mt: 0.5, height: SIZES.progressBarHeight, borderRadius: RADII_PX.pill, '& .MuiLinearProgress-bar': { bgcolor: LIB_ACCENT, borderRadius: RADII_PX.pill } };

function TrackRow({ track }) {
  const navigate = useNavigate();
  return (
    <ButtonBase onClick={() => navigate(`/prep/${track.slug}`)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: SIZES.fill, textAlign: 'left', fontFamily: 'inherit' }}>
      <CompanyAvatar name={track.name} logoUrl={track.logoUrl} size={SIZES.avatar.md} />
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Typography noWrap sx={{ fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.semibold }}>{track.name}</Typography>
          <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, fontVariantNumeric: 'tabular-nums' }}>{Math.round(track.readiness)}%</Typography>
        </Stack>
        <LinearProgress variant="determinate" value={track.readiness} sx={barSx} />
      </Box>
    </ButtonBase>
  );
}

function CardBody({ tracks }) {
  if (tracks === null) return <Skeleton variant="rounded" height={SIZES.avatar.lg * 2} />;
  const started = startedTracks(tracks);
  if (started.length === 0) return <Typography sx={{ color: 'text.secondary', fontSize: FONT_SIZES.body }}>No preparation started yet</Typography>;
  return (
    <Stack spacing={2}>
      {started.map((track) => (
        <TrackRow key={track.slug} track={track} />
      ))}
    </Stack>
  );
}

// How far the learner is in each company track they started.
export default function YourPreparationCard({ tracks }) {
  return (
    <AppCard component="section" aria-label="Your preparation">
      <RailCardTitle>Your preparation</RailCardTitle>
      <CardBody tracks={tracks} />
    </AppCard>
  );
}
