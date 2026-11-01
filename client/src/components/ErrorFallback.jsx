import { Box, Button, Stack, Typography } from '@mui/material';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { LIB_TRACKING, HeaderTile, LibraryFont, libPanelSx, libSolidBtnSx, libTintBtnSx, useLibraryPalette } from '../features/dashboard/components/libraryStyle';

const MAX_REPORTED_MESSAGE_LENGTH = 160;
const FULL_WIDTH_ON_PHONE = { width: { xs: '100%', sm: 'auto' } };

// Pre-fills the Help & Support bug form so the user does not have to describe the crash from scratch.
const buildReportUrl = (message) => `/help?type=bug&err=${encodeURIComponent(message)}&from=${encodeURIComponent(window.location.pathname)}`;

// Technical detail is shown to developers only; end users get the plain explanation.
function DevErrorDetail({ message }) {
  if (!import.meta.env.DEV) return null;
  return (
    <Box sx={{ ...libPanelSx, p: 1.5, width: '100%' }}>
      <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-word', color: 'error.main' }}>
        {message}
      </Typography>
    </Box>
  );
}

function ErrorActions({ reportUrl }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%', justifyContent: 'center', pt: 1 }}>
      <Button disableElevation onClick={() => window.location.reload()} sx={{ ...libSolidBtnSx, ...FULL_WIDTH_ON_PHONE }}>
        Reload page
      </Button>
      <Button component="a" href="/" sx={{ ...libTintBtnSx, ...FULL_WIDTH_ON_PHONE }}>
        Go home
      </Button>
      <Button component="a" href={reportUrl} sx={{ ...libTintBtnSx, ...FULL_WIDTH_ON_PHONE }}>
        Report problem
      </Button>
    </Stack>
  );
}

function ErrorContent({ message }) {
  const palette = useLibraryPalette();
  return (
    <Stack spacing={2} sx={{ maxWidth: 440, width: '100%', textAlign: 'center', alignItems: 'center' }}>
      <HeaderTile>
        <ErrorOutlineRoundedIcon sx={{ fontSize: 28, color: '#fff' }} />
      </HeaderTile>
      <Typography component="h1" sx={{ fontWeight: 700, fontSize: 26, lineHeight: '32px' }}>
        Something went wrong
      </Typography>
      <Typography sx={{ fontSize: 17, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: palette.muted }}>
        An unexpected error occurred while loading this page. Try reloading. If the problem continues, please report it and we will look into it.
      </Typography>
      <DevErrorDetail message={message} />
      <ErrorActions reportUrl={buildReportUrl(message)} />
    </Stack>
  );
}

// Full-screen error state in the Library look (cream surface in light mode, normal dark surface in dark mode).
// Same layout on phone and desktop; only the button stacking changes, so no separate views are needed.
export default function ErrorFallback({ error }) {
  const palette = useLibraryPalette();
  const message = String(error?.message || error).slice(0, MAX_REPORTED_MESSAGE_LENGTH);

  return (
    <LibraryFont sx={{ bgcolor: palette.bg }}>
      <Box role="alert" sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <ErrorContent message={message} />
      </Box>
    </LibraryFont>
  );
}
