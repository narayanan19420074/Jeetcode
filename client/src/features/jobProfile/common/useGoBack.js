import { useLocation, useNavigate } from 'react-router-dom';

// Back to the screen the member came from. A profile opened from a shared link has no earlier screen in this
// app (its location key is "default"), so it goes to `fallbackPath` instead of leaving the site.
export default function useGoBack(fallbackPath) {
  const navigate = useNavigate();
  const { key } = useLocation();
  return () => (key === 'default' ? navigate(fallbackPath) : navigate(-1));
}
