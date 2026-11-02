import { useMediaQuery, useTheme } from '@mui/material';
import useStore from './common/useStore';
import StoreDialogs from './common/StoreDialogs';
import StoreMobileView from './mobile/StoreMobileView';
import StoreDesktopView from './desktop/StoreDesktopView';

// Thin entry: loads the shared store state once and picks the phone or the desktop layout.
export default function StorePage() {
  const store = useStore();
  const isPhone = useMediaQuery(useTheme().breakpoints.down('md'), { noSsr: true });
  return (
    <>
      {isPhone ? <StoreMobileView store={store} /> : <StoreDesktopView store={store} />}
      <StoreDialogs store={store} isPhone={isPhone} />
    </>
  );
}
