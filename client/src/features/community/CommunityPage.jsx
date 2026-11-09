import { useMediaQuery, useTheme } from '@mui/material';
import useCommunityPage from './common/useCommunityPage';
import CommunityDesktopView from './desktop/CommunityDesktopView';
import CommunityMobileView from './mobile/CommunityMobileView';

// Thin entry: shared feed state, then the phone or desktop layout.
export default function CommunityPage() {
  const page = useCommunityPage();
  const isPhone = useMediaQuery(useTheme().breakpoints.down('md'));
  return isPhone ? <CommunityMobileView page={page} /> : <CommunityDesktopView page={page} />;
}
