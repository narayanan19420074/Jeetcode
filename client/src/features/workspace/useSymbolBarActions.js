// Phone symbol bar: types a symbol, or runs an editor command, at the caret.

// A word still being composed by the phone keyboard (predictive text) swallows programmatic input,
// so commit it first: re-focusing the text area ends the composition and the keyboard stays open.
function commitComposedWord(editor, composingRef) {
  if (!composingRef.current) return;
  const area = editor.getContainerDomNode?.().querySelector('textarea');
  area?.blur();
  area?.focus();
  composingRef.current = false;
}

// Fallback for when the editor ignored the typed text: insert it directly at the cursor(s).
function insertAtCursors(editor, text) {
  const selections = editor.getSelections() ?? [];
  const edits = selections.map((range) => ({ range, text, forceMoveMarkers: true }));
  const endSelections = selections.map((range) => ({
    selectionStartLineNumber: range.startLineNumber,
    selectionStartColumn: range.startColumn + text.length,
    positionLineNumber: range.startLineNumber,
    positionColumn: range.startColumn + text.length,
  }));
  editor.executeEdits('key-bar', edits, endSelections);
}

export default function useSymbolBarActions({ editorRef, composingRef }) {
  const keyType = (text) => {
    const editor = editorRef.current;
    if (!editor) return;
    commitComposedWord(editor, composingRef);
    editor.focus();
    const model = editor.getModel();
    const versionBefore = model?.getVersionId();
    editor.trigger('keyboard', 'type', { text });
    if (model && model.getVersionId() === versionBefore) insertAtCursors(editor, text);
  };

  const keyCommand = (commandId) => () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    editor.trigger('keyboard', commandId, null);
  };

  return { keyType, keyCommand };
}
