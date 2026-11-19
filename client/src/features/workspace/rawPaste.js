// Why this exists: on some phone keyboards a paste reaches the editor as typed text. The editor then
// runs auto-indent on every pasted line, which adds the previous line's indent on top of the pasted
// indent, and Python code ends up with the wrong block structure (a `return` that falls inside a loop,
// for example). Pasted text must land exactly as copied, so multi-line pastes are inserted directly.

const MULTI_LINE_INPUT_TYPES = new Set(['insertText', 'insertFromPaste', 'insertReplacementText']);

const normalizeLineEndings = (text) => text.replace(/\r\n?/g, '\n');

const isMultiLineTextInput = (event) =>
  MULTI_LINE_INPUT_TYPES.has(event.inputType) && typeof event.data === 'string' && event.data.includes('\n');

// Leaves the caret at the end of each inserted block, like a normal paste.
const collapseToEndOfInsertedText = (inverseOperations) =>
  inverseOperations.map(({ range }) => ({
    selectionStartLineNumber: range.endLineNumber,
    selectionStartColumn: range.endColumn,
    positionLineNumber: range.endLineNumber,
    positionColumn: range.endColumn,
  }));

function insertTextAtSelections(editor, text) {
  const edits = (editor.getSelections() ?? []).map((range) => ({ range, text, forceMoveMarkers: true }));
  editor.pushUndoStop();
  editor.executeEdits('raw-paste', edits, collapseToEndOfInsertedText);
  editor.pushUndoStop();
}

function takeOverEvent(event) {
  event.preventDefault();
  event.stopPropagation();
}

// Returns a function that removes the listeners. `onInserted` runs after every handled paste.
export function installRawPaste(editor, onInserted) {
  const container = editor.getContainerDomNode();

  const insert = (text) => {
    insertTextAtSelections(editor, normalizeLineEndings(text));
    onInserted?.();
  };
  const handlePaste = (event) => {
    const text = event.clipboardData?.getData('text/plain');
    if (!text) return; // images and other clipboard content stay with the editor
    takeOverEvent(event);
    insert(text);
  };
  const handleBeforeInput = (event) => {
    if (!isMultiLineTextInput(event)) return;
    takeOverEvent(event);
    insert(event.data);
  };

  container.addEventListener('paste', handlePaste, true);
  container.addEventListener('beforeinput', handleBeforeInput, true);
  return () => {
    container.removeEventListener('paste', handlePaste, true);
    container.removeEventListener('beforeinput', handleBeforeInput, true);
  };
}
