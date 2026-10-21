// Colour system for the workspace (editor, console, mobile chrome).
//
// Built on the app's own Material 3 / Google-style tokens (theme/theme.js) so
// the workspace is not a separate "blue-tinted" look: one accent (the user's
// accent from Settings), neutral tonal surfaces, and syntax colours taken from
// the GitHub Primer code palette (AA contrast on both backgrounds).
//
// Surface layers, back to front:
//   canvas  - the code itself (editor)
//   chrome  - navbar, tabs, toolbar, key bar
//   panel   - console / results
//   raised  - problem card, key caps, inline code chips
import { gpayTokens } from '../../theme/theme';

export const wsSurface = (t) => {
  const dark = t.palette.mode === 'dark';
  const g = gpayTokens[dark ? 'dark' : 'light'];
  return {
    canvas: dark ? g.bg : t.palette.background.paper,
    chrome: t.palette.background.paper,
    panel: dark ? g.paper : g.bg,
    raised: g.tonal,
    line: t.palette.divider,
  };
};

const SYNTAX = {
  light: { text: '1F1F1F', comment: '6E7781', keyword: 'CF222E', string: '0A3069', number: '0550AE', type: '953800', regexp: '116329' },
  dark: { text: 'E3E3E3', comment: '8B949E', keyword: 'FF7B72', string: 'A5D6FF', number: '79C0FF', type: 'FFA657', regexp: '7EE787' },
};

export function defineMonacoThemes(monaco, primary) {
  [
    ['light', 'vs'],
    ['dark', 'vs-dark'],
  ].forEach(([mode, base]) => {
    const g = gpayTokens[mode];
    const c = SYNTAX[mode];
    const dark = mode === 'dark';
    const canvas = dark ? g.bg : g.paper;
    monaco.editor.defineTheme(`jeetcode-${mode}`, {
      base,
      inherit: true,
      rules: [
        { token: '', foreground: c.text },
        { token: 'comment', foreground: c.comment, fontStyle: 'italic' },
        { token: 'keyword', foreground: c.keyword },
        { token: 'string', foreground: c.string },
        { token: 'number', foreground: c.number },
        { token: 'regexp', foreground: c.regexp },
        { token: 'type', foreground: c.type },
        { token: 'type.identifier', foreground: c.type },
        { token: 'delimiter', foreground: c.text },
        { token: 'operator', foreground: c.keyword },
      ],
      colors: {
        'editor.background': canvas,
        'editor.foreground': `#${c.text}`,
        'editorGutter.background': canvas,
        'editorLineNumber.foreground': dark ? '#6E7681' : '#8C959F',
        'editorLineNumber.activeForeground': `#${c.text}`,
        'editor.lineHighlightBackground': dark ? g.paper : g.bg,
        'editor.lineHighlightBorder': '#00000000',
        'editor.selectionBackground': g.hero,
        'editor.inactiveSelectionBackground': `${g.hero}99`,
        'editorCursor.foreground': primary,
        'editorIndentGuide.background': g.tonal,
        'editorIndentGuide.background1': g.tonal,
        'editorIndentGuide.activeBackground': g.lineSolid,
        'editorIndentGuide.activeBackground1': g.lineSolid,
        'editorBracketMatch.background': `${g.hero}99`,
        'editorBracketMatch.border': primary,
        'editorWhitespace.foreground': g.lineSolid,
        'editorWidget.background': dark ? g.tonal : g.paper,
        'editorSuggestWidget.background': dark ? g.tonal : g.paper,
        'scrollbarSlider.background': dark ? '#FFFFFF2E' : '#00000024',
        'scrollbarSlider.hoverBackground': dark ? '#FFFFFF47' : '#00000038',
        'scrollbarSlider.activeBackground': dark ? '#FFFFFF5C' : '#0000004D',
      },
    });
  });
}

// Settings -> Editor theme: "Match app" follows the UI mode; "Dark" / "Light"
// use the JeetCode palettes; high contrast stays Monaco's own.
export const monacoThemeName = (pref, uiMode) => {
  if (pref === 'auto') return uiMode === 'dark' ? 'jeetcode-dark' : 'jeetcode-light';
  if (pref === 'vs-dark') return 'jeetcode-dark';
  if (pref === 'vs') return 'jeetcode-light';
  return pref;
};
