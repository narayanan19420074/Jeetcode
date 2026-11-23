import { Box, Button, ButtonBase, Stack, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useLibraryCardSx } from '../../dashboard/components/libraryCardStyles';
import { LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { pillButtonSx } from '../../dashboard/components/libraryDesktopStyles';
import { Coins } from '../storeUtils';
import DailyReward from './DailyReward';
import OrdersButton from './OrdersButton';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

function CoinsButton({ balance, onWallet, palette }) {
  return (
    <ButtonBase onClick={onWallet} aria-label="Open coin wallet" sx={{ width: SIZES.fill, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, fontFamily: 'inherit', color: 'inherit', textAlign: 'left' }}>
      <Box>
        <Typography sx={{ fontSize: FONT_SIZES.body, letterSpacing: LIB_TRACKING, color: palette.muted }}>Your coins</Typography>
        <Coins value={balance} size={32} />
      </Box>
      <Stack direction="row" sx={{ alignItems: 'center', color: palette.muted }}>
        <Typography sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING }}>Wallet</Typography>
        <ChevronRightRoundedIcon />
      </Stack>
    </ButtonBase>
  );
}

function GuestPrompt({ onSignIn, palette }) {
  return (
    <>
      <Typography sx={{ fontSize: FONT_SIZES.title, color: palette.muted }}>Sign in to see your coins and redeem items.</Typography>
      <Button onClick={onSignIn} disableElevation sx={pillButtonSx(true, palette)}>Sign in</Button>
    </>
  );
}

// Left card of the Store page, built like "Your progress" on the Problems page: coin balance, the daily reward and orders,
// or a sign-in prompt for visitors.
export default function WalletCard({ isAuthenticated, balance, daily, claiming, onClaim, onWallet, inTransit, onOrders, onSignIn }) {
  const cardSx = useLibraryCardSx();
  const palette = useLibraryPalette();
  return (
    <Box component="section" aria-label="Your coins" sx={cardSx}>
      {isAuthenticated ? (
        <>
          <CoinsButton balance={balance} onWallet={onWallet} palette={palette} />
          <DailyReward daily={daily} claiming={claiming} onClaim={onClaim} />
          <OrdersButton inTransit={inTransit} onOrders={onOrders} />
        </>
      ) : <GuestPrompt onSignIn={onSignIn} palette={palette} />}
    </Box>
  );
}
