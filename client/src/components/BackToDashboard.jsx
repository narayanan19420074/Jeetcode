import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

// Small back icon that sits inside a page's own header and returns to the dashboard
// (visitors who are not signed in go to the home page instead).
export default function BackToDashboard({ sx }) {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  return (
    <Tooltip title="Back to dashboard">
      <IconButton
        component={RouterLink}
        to={isAuthenticated ? '/dashboard' : '/'}
        size="small"
        aria-label="Back to dashboard"
        sx={[
          { flexShrink: 0, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <ArrowBackRoundedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
