import { Link as RouterLink } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { pillButtonSx } from '../../dashboard/components/libraryDesktopStyles';
import { FONT_SIZES } from '../../../app/design/designTokens';

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
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 1, color: palette.muted }}>
      <CheckCircleRoundedIcon sx={{ fontSize: FONT_SIZES.subheading, color: 'var(--jc-easy)' }} />
      <Typography sx={{ fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING }}>Checked in today</Typography>
    </Stack>
  );
}
