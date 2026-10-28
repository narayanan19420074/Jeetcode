import { useEffect, useRef } from 'react';

// Keyboard shortcuts (desktop): Ctrl/Cmd + ' runs, Ctrl/Cmd + Enter submits.
// busy = ignore the shortcut (a run is in flight, or nothing to run yet).
export default function useRunShortcuts({ isMobile, run, submit, busy }) {
  const actionsRef = useRef({});
  actionsRef.current = { run, submit, busy };
  useEffect(() => {
    if (isMobile) return undefined;
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
      const isRun = e.key === "'";
      const isSubmit = e.key === 'Enter';
      if (!isRun && !isSubmit) return;
      const t = e.target;
      const inEditor = t?.closest?.('.monaco-editor');
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (typing && !inEditor) return; // Ctrl+Enter in a chat / comment box must not submit code
      e.preventDefault();
      e.stopPropagation();
      const a = actionsRef.current;
      if (a.busy) return;
      (isRun ? a.run : a.submit)();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [isMobile]);
}
