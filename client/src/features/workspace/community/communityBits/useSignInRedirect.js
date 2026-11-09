import { useLocation, useNavigate } from 'react-router-dom';

// Guests who try to vote or comment are sent to sign in and return to the page they came from.
export default function useSignInRedirect() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return () => navigate('/login', { state: { from: { pathname } } });
}
