import { useMediaQuery } from '@mui/material';
import useAptitudePage from './common/useAptitudePage';
import AptitudeDesktopView from './desktop/AptitudeDesktopView';
import AptitudeMobileView from './mobile/AptitudeMobileView';

// Thin entry: loads the levels once and picks the phone or the desktop layout.
// Phones and small tablets get their own layout (the site navbar is hidden there, see MainLayout).
export default function AptitudePatternsPage() {
  const page = useAptitudePage();
  const isPhone = useMediaQuery((theme) => theme.breakpoints.down('md'), { noSsr: true });
  return isPhone ? <AptitudeMobileView page={page} /> : <AptitudeDesktopView page={page} />;
}
