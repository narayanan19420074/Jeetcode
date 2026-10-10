// Minimal Monaco <-> Y.Text binding (no y-monaco: it imports the whole
// monaco-editor package, which clashes with @monaco-editor/react's CDN copy).
export const LOCAL = 'monaco-local';

export function bindMonaco(editor, monaco, ytext) {
  const model = editor.getModel();
  let applyingRemote = false;

  if (model.getValue() !== ytext.toString()) model.setValue(ytext.toString());

  // Monaco -> Yjs
  const sub = model.onDidChangeContent((e) => {
    if (applyingRemote) return;
    ytext.doc.transact(() => {
      // changes are in pre-edit coordinates; apply from the end so earlier offsets stay valid
      [...e.changes]
        .sort((a, b) => b.rangeOffset - a.rangeOffset)
        .forEach((c) => {
          if (c.rangeLength > 0) ytext.delete(c.rangeOffset, c.rangeLength);
          if (c.text) ytext.insert(c.rangeOffset, c.text);
        });
    }, LOCAL);
  });

  // Yjs -> Monaco
  const observer = (event, tr) => {
    if (tr.origin === LOCAL) return;
    const edits = [];
    let index = 0;
    for (const op of event.delta) {
      if (op.retain !== undefined) {
        index += op.retain;
      } else if (op.insert !== undefined) {
        const pos = model.getPositionAt(index);
        edits.push({
          range: new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
          text: op.insert,
          forceMoveMarkers: true,
        });
      } else if (op.delete !== undefined) {
        const from = model.getPositionAt(index);
        const to = model.getPositionAt(index + op.delete);
        edits.push({ range: new monaco.Range(from.lineNumber, from.column, to.lineNumber, to.column), text: '' });
        index += op.delete;
      }
    }
    applyingRemote = true;
    try {
      model.applyEdits(edits);
    } finally {
      applyingRemote = false;
    }
  };
  ytext.observe(observer);

  return () => {
    sub.dispose();
    ytext.unobserve(observer);
  };
}
