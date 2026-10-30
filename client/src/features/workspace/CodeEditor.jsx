import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import { Box, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditorScroller from './EditorScroller';
import MobileKeyBar from './MobileKeyBar';
import { MOBILE_EDITOR_OPTIONS } from './editorOptions';
import { formatCode, preloadFormatter, replaceChangedSpan } from './formatCode';
import { defineMonacoThemes, monacoThemeName, wsSurface } from './workspaceTheme';

// The one code editor used by the problem workspace AND the pair room.
// Owns everything that is not page-specific: Monaco options from Settings ->
// Editor, JeetCode themes, phone chrome (fast-scroller + symbol bar), and the
// formatter (auto while typing, or on request through the ref).
//
//   language     Monaco language id
//   path         optional model path (workspace: one model per problem + language)
//   value        controlled text. Leave undefined when something else owns the
//                text (pair room: Yjs binding done in onReady)
//   onChange     (text) => void
//   tabSize      indent width, also what the formatter uses
//   isMobile     phone layout
//   hidden       hide while another pane is maximized
//   autoFormat   format shortly after typing / pasting (off in the shared room)
//   resetKey     change it (e.g. problem slug) to drop a pending auto-format
//   onReady      (editor, monaco) => optional cleanup fn; called once on mount
//   onFormatKey  adds a "format" key to the phone symbol bar
//
// ref: { format() -> Promise<boolean changed>, cancelPendingFormat() }
const FONT = '"JetBrains Mono", "Fira Code", Menlo, Consolas, monospace';

const CodeEditor = forwardRef(function CodeEditor(
  { language, path, value, onChange, tabSize, isMobile, hidden = false, autoFormat = false, resetKey, onReady, onFormatKey },
  ref
) {
  const theme = useTheme();
  const prefs = useSelector((s) => s.ui.editor);
  const uiMode = useSelector((s) => s.ui.mode);
  const surf = wsSurface(theme);
  const accent = theme.palette.primary.main;

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const disposeRef = useRef(null);
  const [editor, setEditor] = useState(null); // fast-scroller needs the instance
  const [focused, setFocused] = useState(false); // phone: shows the symbol bar

  const fmtTimer = useRef(null);
  const composingRef = useRef(false);
  const pasteUntil = useRef(0);
  const ctx = useRef({});
  ctx.current = { language, tabSize, autoFormat, onReady };

  useEffect(() => {
    if (autoFormat && language === 'javascript') preloadFormatter();
  }, [autoFormat, language]);
  useEffect(() => () => {
    clearTimeout(fmtTimer.current);
    disposeRef.current?.();
  }, []);
  // A pending auto-format must not fire into the next problem's editor.
  useEffect(() => {
    clearTimeout(fmtTimer.current);
  }, [resetKey]);

  // Editor colours follow the app accent / light-dark mode.
  useEffect(() => {
    const m = monacoRef.current;
    if (!m) return;
    defineMonacoThemes(m, accent);
    m.editor.setTheme(monacoThemeName(prefs.theme, uiMode));
  }, [accent, prefs.theme, uiMode]);

  // Prettier (JS) / indentation fixer (Python) / tab fixer (C++). Returns true when the text changed.
  const formatNow = useCallback(async (auto = false) => {
    const ed = editorRef.current;
    const model = ed?.getModel();
    if (!ed || !model) return false;
    if (auto) {
      if (composingRef.current) return false;
      const sel = ed.getSelection();
      if (sel && !sel.isEmpty()) return false;
    }
    const src = model.getValue();
    const { language: lang, tabSize: tab } = ctx.current;
    const res = await formatCode(lang, src, model.getOffsetAt(ed.getPosition()), { tabSize: tab });
    // nothing to do, or the user kept typing while we were formatting
    if (res.code === src || model.getValue() !== src || (auto && composingRef.current)) return false;
    replaceChangedSpan(ed, src, res);
    return true;
  }, []);

  const scheduleAutoFormat = useCallback(
    (delay = 1200) => {
      if (!ctx.current.autoFormat || Date.now() < pasteUntil.current) return; // a paste already queued a faster format
      clearTimeout(fmtTimer.current);
      fmtTimer.current = setTimeout(() => formatNow(true), delay);
    },
    [formatNow]
  );

  useImperativeHandle(
    ref,
    () => ({
      format: () => formatNow(false),
      cancelPendingFormat: () => clearTimeout(fmtTimer.current),
    }),
    [formatNow]
  );

  const handleMount = (ed, monaco) => {
    editorRef.current = ed;
    monacoRef.current = monaco;
    setEditor(ed);
    // Don't touch the text while the phone keyboard is composing a word.
    ed.onDidCompositionStart(() => {
      composingRef.current = true;
    });
    ed.onDidCompositionEnd(() => {
      composingRef.current = false;
      scheduleAutoFormat();
    });
    ed.onDidFocusEditorText(() => setFocused(true));
    ed.onDidBlurEditorText(() => setFocused(false));
    ed.onDidPaste(() => {
      if (!ctx.current.autoFormat) return;
      clearTimeout(fmtTimer.current);
      pasteUntil.current = Date.now() + 500;
      fmtTimer.current = setTimeout(() => formatNow(true), 250);
    });
    disposeRef.current?.();
    const cleanup = ctx.current.onReady?.(ed, monaco);
    disposeRef.current = typeof cleanup === 'function' ? cleanup : null;
  };

  const handleChange = (text) => {
    onChange?.(text);
    scheduleAutoFormat();
  };

  // Symbol bar actions (phone)
  const keyType = (text) => {
    const ed = editorRef.current;
    if (!ed) return;
    // A word still being composed by the phone keyboard (predictive text) swallows programmatic input,
    // so commit it first: re-focusing the text area ends the composition and the keyboard stays open.
    if (composingRef.current) {
      const area = ed.getContainerDomNode?.().querySelector('textarea');
      area?.blur();
      area?.focus();
      composingRef.current = false;
    }
    ed.focus();
    const model = ed.getModel();
    const before = model?.getVersionId();
    ed.trigger('keyboard', 'type', { text });
    // Fallback: if the editor ignored the typed text, insert it directly at the cursor(s).
    if (model && model.getVersionId() === before) {
      const sels = ed.getSelections() ?? [];
      ed.executeEdits(
        'key-bar',
        sels.map((range) => ({ range, text, forceMoveMarkers: true })),
        sels.map((r) => ({ ...r, selectionStartLineNumber: r.startLineNumber, selectionStartColumn: r.startColumn + text.length, positionLineNumber: r.startLineNumber, positionColumn: r.startColumn + text.length }))
      );
    }
  };
  const keyCommand = (id) => () => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.focus();
    ed.trigger('keyboard', id, null);
  };

  return (
    <>
      <Box sx={{ position: 'relative', bgcolor: surf.canvas, flex: 1, minHeight: 0, display: hidden ? 'none' : 'block' }}>
        <Editor
          height="100%"
          path={path}
          language={language}
          theme={monacoThemeName(prefs.theme, uiMode)}
          beforeMount={(monaco) => {
            monacoRef.current = monaco;
            defineMonacoThemes(monaco, accent);
          }}
          value={value}
          onChange={handleChange}
          onMount={handleMount}
          loading={<CircularProgress size={26} />}
          options={{
            fontSize: prefs.fontSize,
            fontFamily: FONT,
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
            padding: { top: 12, bottom: 12 },
            ...(isMobile ? MOBILE_EDITOR_OPTIONS : { lineNumbersMinChars: 3 }),
          }}
        />
        {isMobile && <EditorScroller editor={editor} />}
      </Box>

      {isMobile && focused && (
        <MobileKeyBar
          onKey={keyType}
          onTab={keyCommand('tab')}
          onOutdent={keyCommand('outdent')}
          onDeleteLine={keyCommand('editor.action.deleteLines')}
          onUp={keyCommand('cursorUp')}
          onDown={keyCommand('cursorDown')}
          onLeft={keyCommand('cursorLeft')}
          onRight={keyCommand('cursorRight')}
          onUndo={keyCommand('undo')}
          onRedo={keyCommand('redo')}
          onFormat={onFormatKey}
        />
      )}
    </>
  );
});

export default CodeEditor;
