import { useCallback, useEffect, useMemo, useRef } from 'react';
import { formatCode, preloadFormatter, replaceChangedSpan } from './formatCode';

const TYPING_FORMAT_DELAY_MS = 1200;
const PASTE_FORMAT_DELAY_MS = 250;
// A paste queues its own, faster format; typing must not queue a slower one on top of it.
const PASTE_QUIET_PERIOD_MS = 500;

// The text is only touched when it is safe: not while the phone keyboard is composing a word, and not while the user has a selection.
function isSafeToAutoFormat(editor, composingRef) {
  if (composingRef.current) return false;
  const selection = editor.getSelection();
  return !selection || selection.isEmpty();
}

// Prettier (JS) / indentation fixer (Python) / tab fixer (C++). Returns true when the text changed.
async function formatEditorText(editor, { language, tabSize }, composingRef, isAuto) {
  const model = editor?.getModel();
  if (!model) return false;
  if (isAuto && !isSafeToAutoFormat(editor, composingRef)) return false;

  const source = model.getValue();
  const result = await formatCode(language, source, model.getOffsetAt(editor.getPosition()), { tabSize });
  // Nothing to do, or the user kept typing while the formatter was running.
  const isStale = model.getValue() !== source || (isAuto && composingRef.current);
  if (result.code === source || isStale) return false;
  replaceChangedSpan(editor, source, result);
  return true;
}

function useFormatterLifecycle({ language, autoFormat, resetKey }, timerRef) {
  useEffect(() => {
    if (autoFormat && language === 'javascript') preloadFormatter();
  }, [autoFormat, language]);
  useEffect(() => () => clearTimeout(timerRef.current), [timerRef]);
  // A pending auto-format must not fire into the next problem's editor.
  useEffect(() => {
    clearTimeout(timerRef.current);
  }, [resetKey, timerRef]);
}

// Owns the auto-format timers for the workspace editor. The returned object is stable across renders.
export default function useEditorFormatter(settings) {
  const editorRef = useRef(null);
  const timerRef = useRef(null);
  const composingRef = useRef(false);
  const pasteUntilRef = useRef(0);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  useFormatterLifecycle(settings, timerRef);

  const formatNow = useCallback(
    (isAuto = false) => formatEditorText(editorRef.current, settingsRef.current, composingRef, isAuto),
    []
  );
  const queueFormat = useCallback(
    (delay) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => formatNow(true), delay);
    },
    [formatNow]
  );
  const scheduleAutoFormat = useCallback(() => {
    if (!settingsRef.current.autoFormat || Date.now() < pasteUntilRef.current) return;
    queueFormat(TYPING_FORMAT_DELAY_MS);
  }, [queueFormat]);
  const schedulePasteFormat = useCallback(() => {
    if (!settingsRef.current.autoFormat) return;
    pasteUntilRef.current = Date.now() + PASTE_QUIET_PERIOD_MS;
    queueFormat(PASTE_FORMAT_DELAY_MS);
  }, [queueFormat]);
  const cancelPendingFormat = useCallback(() => clearTimeout(timerRef.current), []);

  return useMemo(
    () => ({ editorRef, composingRef, formatNow, scheduleAutoFormat, schedulePasteFormat, cancelPendingFormat }),
    [formatNow, scheduleAutoFormat, schedulePasteFormat, cancelPendingFormat]
  );
}
