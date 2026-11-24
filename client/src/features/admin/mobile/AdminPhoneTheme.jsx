import { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LIBRARY_PALETTE } from '../../../app/design/designTokens';
import { modeKey } from '../../../app/design/modeHelpers';
import { adminPhoneThemeOptions } from './adminPhoneThemeOptions';

// Gives every admin page on a phone the learner Library look. Must sit inside LibraryFont, which sets the font and
// palette variables. Dialogs and menus opened from a page render in a portal but still read this theme.
export default function AdminPhoneTheme({ children }) {
  const theme = useMemo(
    () => (outer) => createTheme(outer, adminPhoneThemeOptions(LIBRARY_PALETTE[modeKey(outer.palette.mode)])),
    [],
  );
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
