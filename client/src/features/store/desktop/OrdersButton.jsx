import { Button } from '@mui/material';
import { useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { pillButtonSx } from '../../dashboard/components/libraryDesktopStyles';

// Opens "My orders". Physical orders that are still on their way are counted in the label, so nobody misses a delivery.
export default function OrdersButton({ inTransit, onOrders }) {
  const palette = useLibraryPalette();
  const label = inTransit > 0 ? `My orders (${inTransit} in transit)` : 'My orders';
  return <Button onClick={onOrders} fullWidth disableElevation sx={pillButtonSx(false, palette)}>{label}</Button>;
}
