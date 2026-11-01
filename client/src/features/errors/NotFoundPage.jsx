import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import StatusScreen, { StatusDetail, statusPrimaryButtonSx, statusSecondaryButtonSx } from '../../components/StatusScreen';

// Shown for any URL that does not match a route. Standalone screen, so it works signed in or out.
export default function NotFoundPage() {
  const { pathname } = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <StatusScreen
      icon={SearchOffRoundedIcon}
      title="Page not found"
      description="The page you are looking for does not exist or may have been moved."
      detail={<StatusDetail>{pathname}</StatusDetail>}
    >
      <Button component={RouterLink} to={isAuthenticated ? '/dashboard' : '/'} disableElevation sx={statusPrimaryButtonSx}>
        {isAuthenticated ? 'Go to dashboard' : 'Go to home page'}
      </Button>
      <Button component={RouterLink} to="/problems" sx={statusSecondaryButtonSx}>
        Browse problems
      </Button>
      <Button component={RouterLink} to="/help" sx={statusSecondaryButtonSx}>
        Help & Support
      </Button>
    </StatusScreen>
  );
}
