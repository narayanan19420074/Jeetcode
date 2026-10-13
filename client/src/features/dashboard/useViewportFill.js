import { useLayoutEffect, useState } from 'react';

// Height that makes an element end exactly at the bottom of the window, so the page itself
// never scrolls and inner panels get their own scrollbars. Re-measured when the window
// resizes or when something above it (e.g. the offer banner) is added or removed.
export default function useViewportFill(ref, enabled, min = 480) {
  const [height, setHeight] = useState(null);

  useLayoutEffect(() => {
    if (!enabled) {
      setHeight(null);
      return undefined;
    }
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      setHeight(Math.max(min, Math.round(window.innerHeight - top)));
    };
    measure();
    window.addEventListener('resize', measure);
    const parent = ref.current?.closest('main')?.parentElement;
    const mo = parent ? new MutationObserver(measure) : null;
    if (mo) mo.observe(parent, { childList: true });
    const t = setTimeout(measure, 400); // the banner loads after its API call
    return () => {
      window.removeEventListener('resize', measure);
      mo?.disconnect();
      clearTimeout(t);
    };
  }, [ref, enabled, min]);

  return height;
}
