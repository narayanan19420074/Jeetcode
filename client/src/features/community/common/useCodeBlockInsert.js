import { useRef } from 'react';

const CODE_FENCE = '```\n\n```\n';
// Cursor lands on the empty line between the two fences: the opening fence plus its line break.
const FENCE_OPENING_LENGTH = 4;

// Lets the author insert an empty fenced code block at the cursor of the post body; the server renders fenced
// blocks as formatted code, so this is the only code formatting the editor needs.
export default function useCodeBlockInsert(body, setBody, maxLength) {
  const bodyRef = useRef(null);

  const insertCodeBlock = () => {
    const cursor = bodyRef.current ? bodyRef.current.selectionStart : body.length;
    const before = body.slice(0, cursor);
    const lineBreak = before && !before.endsWith('\n') ? '\n' : '';
    setBody(`${before}${lineBreak}${CODE_FENCE}${body.slice(cursor)}`.slice(0, maxLength));
    const insideFence = before.length + lineBreak.length + FENCE_OPENING_LENGTH;
    requestAnimationFrame(() => {
      bodyRef.current?.focus();
      bodyRef.current?.setSelectionRange(insideFence, insideFence);
    });
  };

  return { bodyRef, insertCodeBlock };
}
