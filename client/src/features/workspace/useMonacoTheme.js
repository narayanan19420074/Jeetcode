import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { defineMonacoThemes, monacoThemeName, wsSurface } from './workspaceTheme';

// Editor colours follow the app accent and light/dark mode. `monacoRef` is filled by beforeMount.
export default function useMonacoTheme(monacoRef) {
  const theme = useTheme();
  const prefs = useSelector((state) => state.ui.editor);
  const uiMode = useSelector((state) => state.ui.mode);
  const accent = theme.palette.primary.main;
  const themeName = monacoThemeName(prefs.theme, uiMode);

  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;
    defineMonacoThemes(monaco, accent);
    monaco.editor.setTheme(themeName);
  }, [accent, themeName, monacoRef]);

  const beforeMount = (monaco) => {
    monacoRef.current = monaco;
    defineMonacoThemes(monaco, accent);
  };

  return { themeName, beforeMount, prefs, surface: wsSurface(theme) };
}
