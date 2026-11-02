import { Box, Button, ButtonBase, Stack, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { panelSx, pillButtonSx } from '../../dashboard/components/libraryDesktopStyles';
import { Coins } from '../storeUtils';
import DailyReward from './DailyReward';

function CoinsButton({ balance, onWallet, palette }) {
  return (
    <ButtonBase onClick={onWallet} aria-label="Open coin wallet" sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, fontFamily: 'inherit', color: 'inherit', textAlign: 'left' }}>
      <Box>
        <Typography sx={{ fontSize: 14, letterSpacing: LIB_TRACKING, color: palette.muted }}>Your coins</Typography>
        <Coins value={balance} size={32} />
      </Box>
      <Stack direction="row" sx={{ alignItems: 'center', color: palette.muted }}>
        <Typography sx={{ fontWeight: 500, fontSize: 15, letterSpacing: LIB_TRACKING }}>Wallet</Typography>
        <ChevronRightRoundedIcon />
      </Stack>
    </ButtonBase>
  );
}

function GuestPrompt({ onSignIn, palette }) {
  return (
    <Stack sx={{ alignItems: 'flex-start', gap: 1.5 }}>
      <Typography sx={{ fontSize: 16, color: palette.muted }}>Sign in to see your coins and redeem items.</Typography>
      <Button onClick={onSignIn} disableElevation sx={pillButtonSx(true, palette)}>Sign in</Button>
    </Stack>
  );
}

// Coin balance with the daily reward under it, or a sign-in prompt for visitors.
export default function WalletPanel({ isAuthenticated, balance, daily, claiming, onClaim, onWallet, onSignIn }) {
  const palette = useLibraryPalette();
  return (
    <Box sx={[panelSx(palette), { display: 'grid', gap: 2, alignContent: 'center' }]}>
      {isAuthenticated ? (
        <>
          <CoinsButton balance={balance} onWallet={onWallet} palette={palette} />
          <DailyReward daily={daily} claiming={claiming} onClaim={onClaim} />
        </>
      ) : <GuestPrompt onSignIn={onSignIn} palette={palette} />}
    </Box>
  );
}
