import { useMediaQuery } from '@mui/material';
import AdminDesktopView from './desktop/AdminDesktopView';
import AdminMobileView from './mobile/AdminMobileView';
import useUnreadChats from './common/useUnreadChats';
import { MEDIA_QUERIES } from '../../app/design/designTokens';

// Full shell for every /admin/* page. This is a standalone layout —
// it is NOT nested inside the client's MainLayout/Navbar (see App.jsx), so nothing here routes outside /admin/*.
// Phones get a Material top app bar and navigation drawer; tablets and desktops get the top bar and permanent sidebar.
// noSsr reads the screen size on the first render, so a phone never flashes the desktop shell.
export default function AdminLayout() {
  const isPhone = useMediaQuery(MEDIA_QUERIES.belowMd, { noSsr: true });
  const unreadChats = useUnreadChats();
  const View = isPhone ? AdminMobileView : AdminDesktopView;
  return <View unreadChats={unreadChats} />;
}
