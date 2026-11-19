import { forwardRef, useImperativeHandle, useRef } from 'react';
import EditorSurface from './EditorSurface';
import EditorSymbolBar from './EditorSymbolBar';
import { buildEditorOptions } from './buildEditorOptions';
import useEditorFormatter from './useEditorFormatter';
import useEditorSession from './useEditorSession';
import useMonacoTheme from './useMonacoTheme';
import useSymbolBarActions from './useSymbolBarActions';

// The one code editor used by the problem workspace AND the pair room.
// Owns everything that is not page-specific: Monaco options from Settings ->
// Editor, JeetCode themes, phone chrome (fast-scroller + symbol bar), and the
// formatter (auto while typing, or on request through the ref). Pasted text is
// inserted exactly as copied (see rawPaste.js).
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
const CodeEditor = forwardRef(function CodeEditor(props, ref) {
  const { language, path, value, onChange, tabSize, isMobile, hidden = false, autoFormat = false, resetKey, onReady, onFormatKey } = props;
  const monacoRef = useRef(null);
  const formatter = useEditorFormatter({ language, tabSize, autoFormat, resetKey });
  const monacoTheme = useMonacoTheme(monacoRef);
  const session = useEditorSession({ formatter, monacoRef, onReady });
  const symbolBarActions = useSymbolBarActions(formatter);

  useImperativeHandle(ref, () => ({ format: () => formatter.formatNow(false), cancelPendingFormat: formatter.cancelPendingFormat }), [formatter]);

  const handleChange = (text) => {
    onChange?.(text);
    formatter.scheduleAutoFormat();
  };
  const editorProps = {
    path,
    language,
    value,
    theme: monacoTheme.themeName,
    beforeMount: monacoTheme.beforeMount,
    onChange: handleChange,
    onMount: session.handleMount,
    options: buildEditorOptions({ prefs: monacoTheme.prefs, isMobile, tabSize }),
  };

  return (
    <>
      <EditorSurface hidden={hidden} surface={monacoTheme.surface} isMobile={isMobile} editor={session.editor} editorProps={editorProps} />
      {isMobile && session.focused && <EditorSymbolBar actions={symbolBarActions} onFormat={onFormatKey} />}
    </>
  );
});

export default CodeEditor;
