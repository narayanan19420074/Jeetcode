import { useLocation, useNavigate } from 'react-router-dom';

// Phone: the problem opens as a panel sliding in from the right. It lives in
// history state so the phone's Back button closes it instead of leaving the page.
export default function useDescPanel(isMobile) {
  const navigate = useNavigate();
  const location = useLocation();
  const descOpen = isMobile && Boolean(location.state?.problemDesc);
  const openDesc = () => navigate(`${location.pathname}${location.search}`, { state: { problemDesc: true } });
  const closeDesc = () => {
    if (location.state?.problemDesc) navigate(-1);
  };
  return { descOpen, openDesc, closeDesc };
}
