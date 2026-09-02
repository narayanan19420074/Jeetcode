import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Guards a route behind authentication, and optionally a specific role
// (e.g. 'admin'). `redirectTo` lets a section send unauthenticated users
// to its own login page instead of the general one — e.g. /admin uses
// redirectTo="/admin/login" — while every other existing caller keeps the
// old default ('/login') with zero changes needed at the call site.
export default function ProtectedRoute({ children, requireRole, redirectTo = '/login' }) {
  const { isAuthenticated, role } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requireRole && role !== requireRole) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          You don't have access to this page
        </Typography>
        <Typography color="text.secondary">This area is restricted to {requireRole}s.</Typography>
        <Button component={RouterLink} to="/dashboard" variant="contained" disableElevation>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return children;
}
