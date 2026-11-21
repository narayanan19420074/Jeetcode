import { Navigate } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@mui/material';

// Wide screens show these pages inside the dashboard main area, next to the sidebar, so the old page URL
// (still linked from menus, emails and bookmarks) redirects there. Phones keep the full-screen page.
export default function DesktopViewRedirect({ view, children }) {
  const isDesktop = useMediaQuery(useTheme().breakpoints.up('md'), { noSsr: true });
  if (isDesktop) return <Navigate to={`/dashboard?view=${view}`} replace />;
  return children;
}
