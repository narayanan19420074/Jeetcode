import { useNavigate } from 'react-router-dom';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ProgressRing from './ProgressRing';
import CompanyAvatar from './CompanyAvatar';
import { COLOR_PALETTE, RADII, RADII_PX, SIZES, withAlpha, SHADOWS } from '../app/design/designTokens';

const AMBER = COLOR_PALETTE.amber[400];
const OTHER_TRACKS_SHOWN = 3;
// Chat-bubble shape: round corners with a small tail at the bottom left.
const BUBBLE_RADIUS = [RADII.dialog, RADII.dialog, RADII.dialog, RADII.badge].map((r) => `${r}px`).join(' ');

const cardSx = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: RADII_PX.card,
  color: COLOR_PALETTE.white,
  background: `linear-gradient(135deg,${COLOR_PALETTE.indigo[950]} 0%,${COLOR_PALETTE.indigo[800]} 55%,${COLOR_PALETTE.violet[700]} 100%)`,
  boxShadow: SHADOWS.cardLit(COLOR_PALETTE.slate[950], 0.85, 0.18),
};

const glowSx = (color, position) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: `radial-gradient(circle, ${color}, transparent 70%)`,
  pointerEvents: 'none',
  ...position,
});

function CardGlows() {
  return (
    <>
      <Box aria-hidden sx={glowSx(withAlpha(COLOR_PALETTE.amber[400], 0.26), { right: -50, top: -50, width: 190, height: 190 })} />
      <Box aria-hidden sx={glowSx(withAlpha(COLOR_PALETTE.white, 0.1), { left: -40, bottom: 20, width: 140, height: 140 })} />
    </>
  );
}

function ExamDuration({ minutes }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5, opacity: 0.85 }}>
      <AccessTimeRoundedIcon sx={{ fontSize: SIZES.chipIconSize }} />
      <Typography variant="caption" sx={{ fontWeight: 'fontWeightSemibold' }}>{minutes} min exam</Typography>
    </Box>
  );
}

function ActiveTrackHeader({ active }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
      <Box sx={{ color: COLOR_PALETTE.white, flexShrink: 0 }}>
        <ProgressRing value={active.readiness ?? 0} max={100} label="Ready" color={AMBER} size={104} strokeWidth={9} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <CompanyAvatar name={active.name} logoUrl={active.logoUrl} size={36} />
        <Typography variant="h5" sx={{ fontWeight: 'fontWeightBold', mt: 1, overflowWrap: 'anywhere' }}>{active.name}</Typography>
        {active.examDurationMinutes && <ExamDuration minutes={active.examDurationMinutes} />}
      </Box>
    </Box>
  );
}

function EncouragementBubble({ active }) {
  const message = active.readiness ? `You are ${active.readiness}% ready. Keep going!` : 'Start this track to see how ready you are.';
  return (
    <Box sx={{ mt: 1.5, px: 1.5, py: 1, borderRadius: BUBBLE_RADIUS, bgcolor: withAlpha(COLOR_PALETTE.white, 0.14) }}>
      <Typography variant="body2" sx={{ fontWeight: 'fontWeightBold' }}>{message}</Typography>
      {active.description && <Typography variant="caption" noWrap sx={{ display: 'block', mt: 0.5, opacity: 0.85 }}>{active.description}</Typography>}
    </Box>
  );
}

function ContinueButton({ active, onOpen }) {
  const buttonSx = {
    mt: 2,
    height: SIZES.touchTarget,
    bgcolor: AMBER,
    color: COLOR_PALETTE.custom.black1B1200,
    fontWeight: 'fontWeightBold',
    '&:hover': { bgcolor: COLOR_PALETTE.amber[400] },
  };
  return (
    <Button onClick={onOpen} startIcon={<BoltRoundedIcon />} endIcon={<ArrowForwardRoundedIcon />} disableElevation fullWidth sx={buttonSx}>
      {active.readiness ? 'Continue prep' : 'Start prep'}
    </Button>
  );
}

function ReadinessBar({ readiness }) {
  const barSx = { mt: 0.5, height: 5, borderRadius: RADII_PX.pill, bgcolor: withAlpha(COLOR_PALETTE.white, 0.18), overflow: 'hidden' };
  const fillSx = { width: `${Math.max(readiness, 4)}%`, height: '100%', borderRadius: RADII_PX.pill, background: `linear-gradient(90deg, ${AMBER}, ${COLOR_PALETTE.amber[500]})` };
  return (
    <Box sx={barSx}>
      <Box sx={fillSx} />
    </Box>
  );
}

function OtherTrackRow({ track, onOpen }) {
  const buttonSx = { display: 'flex', alignItems: 'center', gap: 1, p: 0, border: 0, bgcolor: 'transparent', color: 'inherit', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer' };
  return (
    <Box component="button" type="button" onClick={onOpen} sx={buttonSx}>
      <CompanyAvatar name={track.name} logoUrl={track.logoUrl} size={26} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="caption" noWrap sx={{ fontWeight: 'fontWeightSemibold' }}>{track.name}</Typography>
          <Typography variant="caption" sx={{ fontWeight: 'fontWeightBold', color: COLOR_PALETTE.amber[200], fontVariantNumeric: 'tabular-nums' }}>{track.readiness}%</Typography>
        </Box>
        <ReadinessBar readiness={track.readiness} />
      </Box>
    </Box>
  );
}

function OtherTracks({ tracks, average, onOpen }) {
  return (
    <Box sx={{ mt: 2, display: 'grid', gap: 1 }}>
      <Typography variant="micro" sx={{ fontWeight: 'fontWeightBold', letterSpacing: 0.6, opacity: 0.75 }}>ALSO IN PROGRESS · AVG {average}%</Typography>
      {tracks.map((track) => (
        <OtherTrackRow key={track.slug} track={track} onOpen={() => onOpen(track.slug)} />
      ))}
    </Box>
  );
}

function ActiveTrackBody({ active, others, average, onOpen }) {
  return (
    <>
      <ActiveTrackHeader active={active} />
      <EncouragementBubble active={active} />
      <ContinueButton active={active} onOpen={() => onOpen(active.slug)} />
      {others.length > 0 && <OtherTracks tracks={others} average={average} onOpen={onOpen} />}
    </>
  );
}

function EmptyReadiness() {
  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography variant="h5" sx={{ fontWeight: 'fontWeightBold' }}>Get exam-ready, company by company</Typography>
      <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>Pick a company to see its exam pattern and track how ready you are.</Typography>
    </Box>
  );
}

// The track being worked on is the one with the highest readiness; the next few started tracks are listed below it.
function summarizeTracks(tracks) {
  const started = tracks.filter((t) => t.readiness !== null && t.readiness > 0);
  const active = started.slice().sort((a, b) => b.readiness - a.readiness)[0] || tracks[0] || null;
  const others = started.filter((t) => t.slug !== active?.slug).slice(0, OTHER_TRACKS_SHOWN);
  const average = started.length ? Math.round(started.reduce((sum, t) => sum + t.readiness, 0) / started.length) : 0;
  return { active, others, average };
}

// Sidebar card for the Companies page: how ready the learner is for the company they are working on.
// `tracks` = the prep tracks from /prep/companies (null while loading). Falls back to a "start here" card.
export default function PrepReadinessCard({ tracks }) {
  const navigate = useNavigate();
  if (tracks === null) return <Skeleton variant="rounded" height={360} sx={{ borderRadius: RADII_PX.card }} />;

  const { active, others, average } = summarizeTracks(tracks);
  const openTrack = (slug) => navigate(`/prep/${slug}`);

  return (
    <Box sx={cardSx}>
      <CardGlows />
      <Box sx={{ position: 'relative', p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.9 }}>
          <BusinessRoundedIcon sx={{ fontSize: SIZES.iconSize.small, color: AMBER }} />
          <Typography variant="overline" sx={{ fontWeight: 'fontWeightBold' }}>PREPARATION READINESS</Typography>
        </Box>
        {active ? <ActiveTrackBody active={active} others={others} average={average} onOpen={openTrack} /> : <EmptyReadiness />}
      </Box>
    </Box>
  );
}
