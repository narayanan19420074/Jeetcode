import { useEffect, useRef, useState } from 'react';
import { installRawPaste } from './rawPaste';

function attachEditorListeners(editor, formatter, setFocused) {
  // Don't touch the text while the phone keyboard is composing a word.
  editor.onDidCompositionStart(() => {
    formatter.composingRef.current = true;
  });
  editor.onDidCompositionEnd(() => {
    formatter.composingRef.current = false;
    formatter.scheduleAutoFormat();
  });
  editor.onDidFocusEditorText(() => setFocused(true));
  editor.onDidBlurEditorText(() => setFocused(false));
  editor.onDidPaste(formatter.schedulePasteFormat);
}

// Mount-time wiring of one Monaco instance. `editor` and `focused` are state because the
// fast-scroller needs the instance and the phone symbol bar shows only while the editor has focus.
export default function useEditorSession({ formatter, monacoRef, onReady }) {
  const [editor, setEditor] = useState(null);
  const [focused, setFocused] = useState(false);
  const disposersRef = useRef([]);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const disposeAll = () => {
    disposersRef.current.forEach((dispose) => dispose());
    disposersRef.current = [];
  };
  useEffect(() => disposeAll, []);

  const handleMount = (monacoEditor, monaco) => {
    disposeAll();
    formatter.editorRef.current = monacoEditor;
    monacoRef.current = monaco;
    setEditor(monacoEditor);
    attachEditorListeners(monacoEditor, formatter, setFocused);
    disposersRef.current.push(installRawPaste(monacoEditor, formatter.schedulePasteFormat));
    // The pair room binds its shared document here and returns a cleanup function.
    const cleanup = onReadyRef.current?.(monacoEditor, monaco);
    if (typeof cleanup === 'function') disposersRef.current.push(cleanup);
  };

  return { editor, focused, handleMount };
}
