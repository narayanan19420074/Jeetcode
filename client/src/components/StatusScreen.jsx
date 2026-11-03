import { Box, Stack, Typography } from '@mui/material';
import { LIB_TRACKING, HeaderTile, LibraryFont, libPanelSx, libSolidBtnSx, libTintBtnSx, useLibraryPalette } from '../features/dashboard/components/libraryStyle';
import { COLOR_PALETTE } from '../app/design/designTokens';

// Shared full-screen layout for status pages (error screen, page not found) in the Library look.
// The layout is identical on phone and desktop; only the button stacking changes, so no separate views are needed.

const FULL_WIDTH_ON_PHONE = { width: { xs: '100%', sm: 'auto' } };
export const statusPrimaryButtonSx = { ...libSolidBtnSx, ...FULL_WIDTH_ON_PHONE };
export const statusSecondaryButtonSx = { ...libTintBtnSx, ...FULL_WIDTH_ON_PHONE };

// Row of action buttons: stacked full width on phones, inline on larger screens.
export function StatusActions({ children }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%', justifyContent: 'center', pt: 1 }}>
      {children}
    </Stack>
  );
}

// Small monospace panel for technical detail (error message, requested URL path).
export function StatusDetail({ children, color }) {
  return (
    <Box sx={{ ...libPanelSx, p: 1.5, width: '100%' }}>
      <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-word', color }}>
        {children}
      </Typography>
    </Box>
  );
}

function StatusContent({ icon: Icon, title, description, detail, children }) {
  const palette = useLibraryPalette();
  return (
    <Stack spacing={2} sx={{ maxWidth: 440, width: '100%', textAlign: 'center', alignItems: 'center' }}>
      <HeaderTile>
        <Icon sx={{ fontSize: 28, color: COLOR_PALETTE.white }} />
      </HeaderTile>
      <Typography component="h1" sx={{ fontWeight: 700, fontSize: 26, lineHeight: '32px' }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 17, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: palette.muted }}>{description}</Typography>
      {detail}
      <StatusActions>{children}</StatusActions>
    </Stack>
  );
}

export default function StatusScreen({ role, ...contentProps }) {
  const palette = useLibraryPalette();
  return (
    <LibraryFont sx={{ bgcolor: palette.bg }}>
      <Box role={role} sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <StatusContent {...contentProps} />
      </Box>
    </LibraryFont>
  );
}
