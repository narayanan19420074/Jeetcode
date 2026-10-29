import { useMemo } from 'react';
import { Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DIFF_COLOR, tint } from '../dashboard/dashboardUtils';
import { LIB_TRACKING, LibraryFont, useLibraryPalette } from '../dashboard/components/libraryStyle';

// Phone workspace in the Library look (same rules as the phone Dashboard and Problems pages):
//   16px page gutter, Roboto, 0.03em tracking, cream surfaces (--lib-*), indigo accent
//   44px back arrow, 40px round controls, 34px chips and tabs, 40px action buttons
//   20px panels, 16px inner blocks, 8px difficulty tags, pills (999) for chips and buttons
// Icons appear only where they carry meaning (back, menu, timer, AI assistant, solved, locked).

const SHORT_DIFF = { Easy: 'Easy', Medium: 'Med.', Hard: 'Hard' };

// Wraps the whole phone workspace: Roboto + library palette, and softer corners / dividers for the
// shared panels (Solutions, Discussion, Submissions, dialogs) so they sit on the cream surface.
export function PhoneScope({ children }) {
  const pal = useLibraryPalette();
  const theme = useMemo(
    () => (outer) => createTheme(outer, { shape: { borderRadius: 16 }, palette: { divider: pal.divider, action: { hover: pal.chip } } }),
    [pal]
  );
  return (
    <ThemeProvider theme={theme}>
      <LibraryFont>{children}</LibraryFont>
    </ThemeProvider>
  );
}

// Same tag as the rows of the phone Problems list.
export function PhoneDifficultyTag({ difficulty }) {
  const color = DIFF_COLOR[difficulty] || 'var(--jc-pending)';
  return (
    <Typography
      component="span"
      sx={{
        flexShrink: 0,
        minWidth: 43,
        textAlign: 'center',
        px: '5px',
        py: '2px',
        borderRadius: '8px',
        fontSize: 15,
        fontWeight: 400,
        letterSpacing: LIB_TRACKING,
        lineHeight: '20px',
        color,
        bgcolor: tint(color, 14),
      }}
    >
      {SHORT_DIFF[difficulty] || difficulty}
    </Typography>
  );
}
