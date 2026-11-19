import { FONTS } from '../../app/design/designTokens';
import { MOBILE_EDITOR_OPTIONS } from './editorOptions';

const EDITOR_PADDING = { top: 12, bottom: 12 };

// Monaco options from Settings -> Editor. Phones also get the compact options (no popups, no minimap).
export function buildEditorOptions({ prefs, isMobile, tabSize }) {
  return {
    fontSize: prefs.fontSize,
    fontFamily: FONTS.mono,
    minimap: { enabled: prefs.minimap },
    wordWrap: isMobile || prefs.wordWrap ? 'on' : 'off', // phones: never scroll sideways
    wrappingIndent: 'indent',
    lineNumbers: prefs.lineNumbers ? 'on' : 'off',
    fontLigatures: prefs.ligatures,
    autoClosingBrackets: prefs.autoClose ? 'languageDefined' : 'never',
    autoClosingQuotes: prefs.autoClose ? 'languageDefined' : 'never',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize,
    insertSpaces: true,
    detectIndentation: false,
    autoIndent: 'full',
    trimAutoWhitespace: true,
    smoothScrolling: true,
    padding: EDITOR_PADDING,
    ...(isMobile ? MOBILE_EDITOR_OPTIONS : { lineNumbersMinChars: 3 }),
  };
}
