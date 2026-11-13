import { useSelector } from 'react-redux';
import { useMediaQuery, useTheme } from '@mui/material';
import MobileProblems from './components/MobileProblems';
import useProblemsPageData from './problems/common/useProblemsPageData';
import ProblemsDesktopView from './problems/desktop/ProblemsDesktopView';

// Thin entry: loads the shared page data once and picks the phone or the desktop layout.
export default function ProblemsPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isPhone = useMediaQuery(useTheme().breakpoints.down('md'));
  const data = useProblemsPageData(isAuthenticated, user?.id);

  if (isPhone) {
    return <MobileProblems isAuthenticated={isAuthenticated} progress={data.progress} featured={data.featured} preset={data.preset} listsApi={data.listsApi} />;
  }
  return <ProblemsDesktopView isAuthenticated={isAuthenticated} {...data} />;
}
