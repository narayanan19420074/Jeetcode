// Colour system for the workspace (editor, console, mobile chrome).
//
// Built on the app's own Material 3 / Google-style tokens (app/theme.js) so
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
import { gpayTokens } from '../../app/theme';
import { SYNTAX, COLOR_PALETTE, hexAlpha } from '../../app/design/designTokens';
import { LIBRARY_PALETTE } from '../dashboard/components/libraryStyle';

// Library look on desktop (light mode): the page and panels are cream. The code area stays white, like a sheet of
// paper on the cream page, and matches the Monaco light theme below. Dark mode keeps the app's own dark surfaces.
const creamSurface = (t) => {
  const cream = LIBRARY_PALETTE.light;
  return { canvas: COLOR_PALETTE.white, chrome: t.palette.background.paper, panel: cream.bg, raised: cream.player, line: t.palette.divider };
};

export const wsSurface = (t) => {
  const dark = t.palette.mode === 'dark';
  if (t.libraryLook && !dark) return creamSurface(t);
  const g = gpayTokens[dark ? 'dark' : 'light'];
  return {
    canvas: dark ? g.bg : t.palette.background.paper,
    chrome: t.palette.background.paper,
    panel: dark ? g.paper : g.bg,
    raised: g.tonal,
    line: t.palette.divider,
  };
};

const tokenRules = (c) => [
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
];

const scrollbarColors = (dark) => ({
  'scrollbarSlider.background': dark ? hexAlpha(COLOR_PALETTE.white, 0.18) : hexAlpha(COLOR_PALETTE.black, 0.141),
  'scrollbarSlider.hoverBackground': dark ? hexAlpha(COLOR_PALETTE.white, 0.278) : hexAlpha(COLOR_PALETTE.black, 0.22),
  'scrollbarSlider.activeBackground': dark ? hexAlpha(COLOR_PALETTE.white, 0.361) : hexAlpha(COLOR_PALETTE.black, 0.302),
});

const guideColors = (g) => ({
  'editorIndentGuide.background': g.tonal,
  'editorIndentGuide.background1': g.tonal,
  'editorIndentGuide.activeBackground': g.lineSolid,
  'editorIndentGuide.activeBackground1': g.lineSolid,
  'editorWhitespace.foreground': g.lineSolid,
});

function editorColors(mode, primary) {
  const g = gpayTokens[mode];
  const c = SYNTAX[mode];
  const dark = mode === 'dark';
  return {
    'editor.background': dark ? g.bg : g.paper,
    'editor.foreground': `#${c.text}`,
    'editorGutter.background': dark ? g.paper : g.bg,
    'editorLineNumber.foreground': dark ? COLOR_PALETTE.gray[400] : COLOR_PALETTE.gray[500],
    'editorLineNumber.activeForeground': `#${c.text}`,
    'editor.lineHighlightBackground': dark ? g.paper : g.bg,
    'editor.lineHighlightBorder': hexAlpha(COLOR_PALETTE.black, 0),
    'editor.selectionBackground': g.hero,
    'editor.inactiveSelectionBackground': hexAlpha(g.hero, 0.6),
    'editorCursor.foreground': primary,
    'editorBracketMatch.background': hexAlpha(g.hero, 0.6),
    'editorBracketMatch.border': primary,
    'editorWidget.background': dark ? g.tonal : g.paper,
    'editorSuggestWidget.background': dark ? g.tonal : g.paper,
    ...guideColors(g),
    ...scrollbarColors(dark),
  };
}

export function defineMonacoThemes(monaco, primary) {
  [
    ['light', 'vs'],
    ['dark', 'vs-dark'],
  ].forEach(([mode, base]) => {
    monaco.editor.defineTheme(`jeetcode-${mode}`, { base, inherit: true, rules: tokenRules(SYNTAX[mode]), colors: editorColors(mode, primary) });
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
