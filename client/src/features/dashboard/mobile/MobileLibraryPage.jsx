import { useState } from 'react';
import { Box, Container } from '@mui/material';
import { SIZES } from '../../../app/design/designTokens';
import DashboardViewSwitch from '../common/DashboardViewSwitch';
import GuestBanner from '../common/GuestBanner';
import LibraryPane from '../common/LibraryPane';
import MobileHome from '../components/MobileHome';
import MobileCalendarSheet from './MobileCalendarSheet';
import MobileHomeHeader from './MobileHomeHeader';
import MobileResumeBar from './MobileResumeBar';

// Keeps the last cards of the home screen from hiding behind the resume bar that floats above the bottom navigation.
const RESUME_BAR_SPACER_UNITS = 9.5;

function MobileHomeSections({ dashboard, onOpenCalendar }) {
  const { user, isAuthenticated, promoCards, progress, nqtDismissed, dismissNqt, showResumeBar } = dashboard;
  return (
    <>
      <MobileHomeHeader user={user} isAuthenticated={isAuthenticated} onOpenCalendar={onOpenCalendar} />
      {!isAuthenticated && <GuestBanner />}
      <MobileHome cards={promoCards} progress={progress} isAuthenticated={isAuthenticated} nqtDismissed={nqtDismissed} onDismissNqt={dismissNqt} />
      {showResumeBar && <Box aria-hidden sx={{ height: (theme) => theme.spacing(RESUME_BAR_SPACER_UNITS) }} />}
    </>
  );
}

// Phone dashboard: the swipeable home sections, and a saved list when one is open. Every other view is a full screen of its own.
export default function MobileLibraryPage({ dashboard }) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { currentView, showResumeBar, resume, dismissResume } = dashboard;
  return (
    <Box sx={{ minHeight: `calc(100vh - ${SIZES.appBarHeight.desktop}px)` }}>
      <Container maxWidth={false} sx={{ maxWidth: SIZES.dashboardMaxWidth, py: 2, px: { xs: 2, sm: 3 } }}>
        <Box component="section" className="autohide-scroll" aria-label="Dashboard content" sx={{ minWidth: SIZES.flexShrinkMinWidth }}>
          <LibraryPane active={currentView === 'library'}>
            <MobileHomeSections dashboard={dashboard} onOpenCalendar={() => setCalendarOpen(true)} />
          </LibraryPane>
          <DashboardViewSwitch dashboard={dashboard} />
        </Box>
      </Container>
      {currentView === 'library' && showResumeBar && <MobileResumeBar resume={resume} onDismiss={dismissResume} />}
      <MobileCalendarSheet open={calendarOpen} onClose={() => setCalendarOpen(false)} dashboard={dashboard} />
    </Box>
  );
}
