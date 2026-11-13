import { useSelector } from 'react-redux';
import BackIconButton from './BackIconButton';

// Small back icon that sits inside a page's own header and returns to the dashboard
// (visitors who are not signed in go to the home page instead).
export default function BackToDashboard({ sx }) {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  return <BackIconButton to={isAuthenticated ? '/dashboard' : '/'} label="Back to dashboard" sx={sx} />;
}
