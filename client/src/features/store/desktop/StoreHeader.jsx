import { Box, Button, Stack, Typography } from '@mui/material';
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded';
import BackToDashboard from '../../../components/BackToDashboard';
import { LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { pillButtonSx } from '../../dashboard/components/libraryDesktopStyles';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';

function OrdersButton({ inTransit, onOrders, palette }) {
  const label = inTransit > 0 ? `My orders, ${inTransit} in transit` : 'My orders';
  return (
    <Button onClick={onOrders} aria-label={label} disableElevation startIcon={<LocalMallRoundedIcon />} sx={pillButtonSx(false, palette)}>
      Orders
      {inTransit > 0 && (
        <Box component="span" aria-hidden sx={{ ml: 1, minWidth: 20, height: 20, px: 0.5, display: 'grid', placeItems: 'center', borderRadius: 10, fontSize: FONT_SIZES.caption, color: COLOR_PALETTE.white, bgcolor: 'error.main' }}>{inTransit}</Box>
      )}
    </Button>
  );
}

export default function StoreHeader({ isAuthenticated, inTransit, onOrders }) {
  const palette = useLibraryPalette();
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
        <BackToDashboard />
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h1" noWrap sx={{ fontSize: FONT_SIZES.displayLg, lineHeight: '32px', fontWeight: FONT_WEIGHTS.bold }}>Store</Typography>
          <Typography sx={{ fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING, color: palette.muted }}>Spend the coins you earn by solving</Typography>
        </Box>
      </Stack>
      {isAuthenticated && <OrdersButton inTransit={inTransit} onOrders={onOrders} palette={palette} />}
    </Stack>
  );
}
