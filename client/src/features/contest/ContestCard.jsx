import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography, alpha } from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { surface } from '../dashboard/dashboardUtils';
import Countdown from './Countdown';
import { fmtDate, inr, useContest } from './contestUtils';

// Dashboard card under the problem library. Stays out of the way if the contest can't be loaded.
export default function ContestCard() {
  const { contest } = useContest();
  if (!contest) return null;

  const upcoming = contest.status === 'upcoming';
  return (
    <Box
      sx={[surface, (t) => ({
        p: { xs: 2, sm: 2.5 }, display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap',
        background: `linear-gradient(100deg, ${alpha(t.palette.warning.main, t.palette.mode === 'dark' ? 0.16 : 0.1)}, transparent 60%), ${t.palette.background.paper}`,
      })]}
    >
      <Box sx={(t) => ({ width: 48, height: 48, borderRadius: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(t.palette.warning.main, 0.18), color: 'warning.main' })}>
        <EmojiEventsRoundedIcon />
      </Box>

      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>STARTS {fmtDate(contest.startsAt).toUpperCase()}</Typography>
        <Typography sx={{ fontWeight: 800, fontSize: 18, lineHeight: 1.25 }}>{contest.title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'warning.main' }}>{inr(contest.prizePool)} cash prize</Typography>
          <Typography variant="body2" color="text.secondary">{contest.problemCount} {contest.difficulty} problems</Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <GroupsRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">{contest.applicants.toLocaleString('en-IN')} applied</Typography>
          </Box>
        </Box>
      </Box>

      {upcoming && <Countdown compact targetIso={contest.startsAt} serverTime={contest.serverTime} />}

      <Button
        component={RouterLink} to="/contest" variant="contained" disableElevation sx={{ fontWeight: 700, flexShrink: 0 }}
        startIcon={contest.applied ? <CheckCircleRoundedIcon /> : null}
      >
        {contest.applied ? 'You are in' : upcoming ? 'View & apply' : 'View'}
      </Button>
    </Box>
  );
}
