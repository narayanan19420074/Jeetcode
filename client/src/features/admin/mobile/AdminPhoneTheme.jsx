import { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { adminPhoneThemeOptions } from './adminPhoneThemeOptions';

// Applies the phone type scale and component sizes to every admin page. Dialogs and menus opened from a page render in
// a portal but still read this theme, so they match.
export default function AdminPhoneTheme({ children }) {
  const theme = useMemo(() => (outer) => createTheme(outer, adminPhoneThemeOptions), []);
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
