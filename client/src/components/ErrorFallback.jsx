import { Button } from '@mui/material';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import StatusScreen, { StatusDetail, statusPrimaryButtonSx, statusSecondaryButtonSx } from './StatusScreen';

const MAX_REPORTED_MESSAGE_LENGTH = 160;

// Pre-fills the Help & Support bug form so the user does not have to describe the crash from scratch.
const buildReportUrl = (message) => `/help?type=bug&err=${encodeURIComponent(message)}&from=${encodeURIComponent(window.location.pathname)}`;

// Technical detail is shown to developers only; end users get the plain explanation.
const buildDevDetail = (message) => (import.meta.env.DEV ? <StatusDetail color="error.main">{message}</StatusDetail> : null);

// Rendered by ErrorBoundary when a page crashes while rendering.
export default function ErrorFallback({ error }) {
  const message = String(error?.message || error).slice(0, MAX_REPORTED_MESSAGE_LENGTH);

  return (
    <StatusScreen
      role="alert"
      icon={ErrorOutlineRoundedIcon}
      title="Something went wrong"
      description="An unexpected error occurred while loading this page. Try reloading. If the problem continues, please report it and we will look into it."
      detail={buildDevDetail(message)}
    >
      <Button disableElevation onClick={() => window.location.reload()} sx={statusPrimaryButtonSx}>
        Reload page
      </Button>
      <Button component="a" href="/" sx={statusSecondaryButtonSx}>
        Go home
      </Button>
      <Button component="a" href={buildReportUrl(message)} sx={statusSecondaryButtonSx}>
        Report problem
      </Button>
    </StatusScreen>
  );
}
