import MobileKeyBar from './MobileKeyBar';

// Phone symbol bar wired to editor commands. Shown only while the editor has focus.
export default function EditorSymbolBar({ actions, onFormat }) {
  const { keyType, keyCommand } = actions;
  return (
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
      onFormat={onFormat}
    />
  );
}
