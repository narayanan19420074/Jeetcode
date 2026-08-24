import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Guards a route behind authentication, and optionally a specific role (e.g. 'admin').
export default function ProtectedRoute({ children, requireRole }) {
  const { isAuthenticated, role } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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
