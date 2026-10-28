import { useEffect } from 'react';

// Phone status bar takes the page's bar colour while the page is open.
export default function useThemeColorMeta(color) {
  useEffect(() => {
    const el = document.querySelector('meta[name="theme-color"]');
    if (!el) return undefined;
    const prev = el.getAttribute('content');
    el.setAttribute('content', color);
    return () => el.setAttribute('content', prev);
  }, [color]);
}
