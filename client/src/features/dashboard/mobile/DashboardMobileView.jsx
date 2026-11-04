import DashboardViewContent from '../common/DashboardViewContent';
import MobileLibraryPage from './MobileLibraryPage';

// These views bring their own header and padding on phones, so nothing of the dashboard page is drawn around them.
const FULL_SCREEN_VIEWS = ['contest', 'leaderboard', 'plans', 'quests', 'explore', 'friends'];

export default function DashboardMobileView({ dashboard }) {
  if (FULL_SCREEN_VIEWS.includes(dashboard.currentView)) return <DashboardViewContent dashboard={dashboard} />;
  return <MobileLibraryPage dashboard={dashboard} />;
}
