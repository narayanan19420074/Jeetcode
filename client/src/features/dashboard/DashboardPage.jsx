import useDashboardState from './common/useDashboardState';
import DashboardDesktopView from './desktop/DashboardDesktopView';
import DashboardMobileView from './mobile/DashboardMobileView';

// Thin entry of /dashboard: the shared state is built once, and the breakpoint decides which layout shows it.
export default function DashboardPage() {
  const dashboard = useDashboardState();
  const View = dashboard.isMdUp ? DashboardDesktopView : DashboardMobileView;
  return <View dashboard={dashboard} />;
}
