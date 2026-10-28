import { useEffect, useRef, useState } from 'react';

// Resizable split panes + maximize (desktop). Sizes are remembered between visits.
//   left     problem / side pane share of the page width
//   console  console share of the editor + console column
const DEFAULT_LEFT = 0.42;
const DEFAULT_CONSOLE = 0.35;
const LEFT_MAX = 0.65;
const CONSOLE_MIN = 0.12;
const CONSOLE_MAX = 0.8;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// storageKey      where the sizes are remembered
// leftMin         smallest share the left pane may shrink to
// onConsoleDrag   called when the console seam is dragged (open the console)
export default function usePaneLayout({ storageKey, leftMin, onConsoleDrag }) {
  const [layout, setLayout] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return {
        left: clamp(Number(raw.left) || DEFAULT_LEFT, leftMin, LEFT_MAX),
        console: clamp(Number(raw.console) || DEFAULT_CONSOLE, CONSOLE_MIN, CONSOLE_MAX),
      };
    } catch {
      return { left: DEFAULT_LEFT, console: DEFAULT_CONSOLE };
    }
  });
  const [maximized, setMaximized] = useState(null); // null | the pane name the page uses ('problem' | 'left' | 'editor' | 'console')
  const rootRef = useRef(null); // the row holding both panes
  const editorColRef = useRef(null); // the editor + console column

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(layout));
    } catch {
      // storage unavailable — layout just won't be remembered
    }
  }, [layout, storageKey]);

  // Esc leaves a maximized pane.
  useEffect(() => {
    if (!maximized) return undefined;
    const onKey = (e) => e.key === 'Escape' && setMaximized(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [maximized]);

  const toggleMax = (which) => setMaximized((m) => (m === which ? null : which));

  const dragLeft = (x) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setLayout((l) => ({ ...l, left: clamp((x - rect.left) / rect.width, leftMin, LEFT_MAX) }));
  };

  const dragConsole = (_x, y) => {
    const el = editorColRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    onConsoleDrag?.();
    setLayout((l) => ({ ...l, console: clamp((rect.bottom - y) / rect.height, CONSOLE_MIN, CONSOLE_MAX) }));
  };

  const resetLeft = () => setLayout((l) => ({ ...l, left: DEFAULT_LEFT }));
  const resetConsole = () => setLayout((l) => ({ ...l, console: DEFAULT_CONSOLE }));

  return { layout, maximized, setMaximized, toggleMax, rootRef, editorColRef, dragLeft, dragConsole, resetLeft, resetConsole };
}
