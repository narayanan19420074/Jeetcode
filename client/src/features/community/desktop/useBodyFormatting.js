// Bold and emoji for the post body textarea. Both work on the current selection and put the cursor back after the
// inserted text. `bodyRef` is the textarea's ref (shared with the code block button).
export default function useBodyFormatting({ bodyRef, body, setBody, maxLength }) {
  const replaceSelection = (before, after = '') => {
    const field = bodyRef.current;
    const start = field ? field.selectionStart : body.length;
    const end = field ? field.selectionEnd : start;
    setBody(`${body.slice(0, start)}${before}${body.slice(start, end)}${after}${body.slice(end)}`.slice(0, maxLength));
    const caret = end + before.length;
    requestAnimationFrame(() => {
      field?.focus();
      field?.setSelectionRange(caret, caret);
    });
  };

  return { bold: () => replaceSelection('**', '**'), insertEmoji: (emoji) => replaceSelection(emoji) };
}
