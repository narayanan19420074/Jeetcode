import { Link as RouterLink } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { pillButtonSx } from '../../dashboard/components/libraryDesktopStyles';

// The one daily action: claim today's coins, solve a problem to unlock the claim, or a confirmation that it is done.
export default function DailyReward({ daily, claiming, onClaim }) {
  const palette = useLibraryPalette();
  if (daily?.eligible) {
    return (
      <Button onClick={onClaim} disabled={claiming} fullWidth disableElevation sx={pillButtonSx(true, palette)}>
        {claiming ? 'Claiming…' : `Claim +${daily.reward} daily coins`}
      </Button>
    );
  }
  if (daily && !daily.claimed) {
    return <Button component={RouterLink} to="/problems" fullWidth disableElevation sx={pillButtonSx(false, palette)}>Solve 1 problem for daily coins</Button>;
  }
  if (!daily?.claimed) return null;
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.75, color: palette.muted }}>
      <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'var(--jc-easy)' }} />
      <Typography sx={{ fontSize: 15, letterSpacing: LIB_TRACKING }}>Checked in today</Typography>
    </Stack>
  );
}
