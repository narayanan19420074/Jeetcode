import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import AdminMobileHeader from './AdminMobileHeader';
import AdminMobileTabBar from './AdminMobileTabBar';
import AdminMoreSheet from './AdminMoreSheet';
import AdminPhoneTheme from './AdminPhoneTheme';
import { useRememberMode } from '../../../components/AdminModeSwitch';
import { SIZES } from '../../../app/design/designTokens';
import { LibraryFont, useLibraryPalette } from '../../dashboard/components/libraryStyle';

// Room for the fixed tab bar plus a small gap, so the last card is never hidden behind it.
const mainSx = (theme) => ({ pb: `calc(${SIZES.bottomNavHeight}px + env(safe-area-inset-bottom) + ${theme.spacing(1.5)})` });

// Admin console on phones: the learner Library look (font, page surface, header, bottom tab bar). The "More" sheet
// holds the sections that do not fit in the tab bar.
export default function AdminMobileView({ unreadChats }) {
  const pal = useLibraryPalette();
  const [moreOpen, setMoreOpen] = useState(false);
  // The desktop switch records the mode; on phones this hook does it so the next sign-in still opens the console.
  useRememberMode('admin');

  return (
    <LibraryFont sx={{ minHeight: SIZES.viewportHeight, bgcolor: pal.bg }}>
      <AdminPhoneTheme>
        <AdminMobileHeader />
        <Box component="main" sx={mainSx}>
          <Outlet />
        </Box>
        <AdminMobileTabBar unreadChats={unreadChats} onMoreClick={() => setMoreOpen(true)} />
        <AdminMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      </AdminPhoneTheme>
    </LibraryFont>
  );
}
