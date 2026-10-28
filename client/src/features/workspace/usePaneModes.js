import { useState } from 'react';
import { useElementWidth } from './wsUi';

// Responsive-by-pane (desktop): what to drop as a pane gets narrower.
// Attach setLeftEl / setRightEl as the refs of the two panes.
export default function usePaneModes(isMobile) {
  const [leftEl, setLeftEl] = useState(null);
  const [rightEl, setRightEl] = useState(null);
  const leftW = useElementWidth(leftEl);
  const rightW = useElementWidth(rightEl);
  return {
    setLeftEl,
    setRightEl,
    tabLabels: !leftW || leftW >= 560 ? 'all' : leftW >= 340 ? 'active' : 'none',
    langMode: isMobile || !rightW || rightW >= 520 ? 'full' : rightW >= 420 ? 'short' : 'icon',
    iconActions: !isMobile && rightW > 0 && rightW < 700, // Run / Submit lose their words
    showKbd: rightW >= 950,
    narrowConsole: !isMobile && rightW > 0 && rightW < 640, // hide cursor status, share -> icon
    hideConsoleLabel: !isMobile && rightW > 0 && rightW < 460,
  };
}
