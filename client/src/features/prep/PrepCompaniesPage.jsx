import { useMediaQuery, useTheme } from '@mui/material';
import usePrepCompanies from './common/usePrepCompanies';
import PrepCompaniesDesktopView from './desktop/PrepCompaniesDesktopView';
import PrepCompaniesMobileView from './mobile/PrepCompaniesMobileView';

// Thin entry: loads the companies once and picks the phone or the desktop layout. Tapping a company opens its
// question roadmap right here, no page change.
export default function PrepCompaniesPage() {
  const state = usePrepCompanies();
  const isPhone = useMediaQuery(useTheme().breakpoints.down('md'));
  return isPhone ? <PrepCompaniesMobileView state={state} /> : <PrepCompaniesDesktopView state={state} />;
}
