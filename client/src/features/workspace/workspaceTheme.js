// Colour system for the workspace (editor, console, mobile chrome).
//
// Built on the app's own Material 3 / Google-style tokens (theme/theme.js) so
// the workspace is not a separate "blue-tinted" look: one accent (the user's
// accent from Settings), neutral tonal surfaces, and syntax colours taken from
// the GitHub Primer code palette (AA contrast on both backgrounds).
//
// The editor is layered like a pro code editor: the code area sits on `canvas`
// and the line-number gutter is a slightly lifted strip beside it, so numbers
// and code never blur together.
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

// Soft, desaturated hues (no neon): every pair is >= 7:1 on its canvas.
const SYNTAX = {
  light: { text: '1F2328', comment: '66707B', keyword: '6F42C1', string: '0A6B3D', number: 'B35900', type: '0550AE', regexp: '0F766E' },
  dark: { text: 'E6EDF3', comment: '8B96A5', keyword: 'C9A9F5', string: '9ECE9A', number: 'F2B880', type: '7CC4F0', regexp: '7FDBCA' },
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
        { token: 'keyword.directive', foreground: c.keyword },
        { token: 'metatag', foreground: c.keyword },
        { token: 'string', foreground: c.string },
        { token: 'string.include', foreground: c.string },
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
        'editorGutter.background': dark ? g.paper : g.bg,
        'editorLineNumber.foreground': dark ? '#8E99A8' : '#6B7280',
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
