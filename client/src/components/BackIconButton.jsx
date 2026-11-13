import { Link as RouterLink } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

// Small bordered back icon used inside a page's own header. Every "back" button in the product shares this look.
export default function BackIconButton({ to, label, sx }) {
  return (
    <Tooltip title={label}>
      <IconButton
        component={RouterLink}
        to={to}
        size="small"
        aria-label={label}
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
