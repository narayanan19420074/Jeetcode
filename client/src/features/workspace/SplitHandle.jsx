import { useRef, useState } from 'react';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Draggable divider for resizable split panes (like ChatGPT / Claude / LeetCode).
 *
 * orientation="vertical"   -> a vertical bar, drag left/right (panes side by side)
 * orientation="horizontal" -> a horizontal bar, drag up/down (panes stacked)
 *
 * onDrag(clientX, clientY) fires continuously while dragging; the parent turns
 * the pointer position into a size. Double-click calls onReset.
 */
export default function SplitHandle({ orientation = 'vertical', onDrag, onReset, label }) {
  const [active, setActive] = useState(false);
  const dragging = useRef(false);
  const isVertical = orientation === 'vertical';

  const stop = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    setActive(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // pointer already released
    }
  };

  return (
    <Box
      role="separator"
      aria-orientation={orientation}
      aria-label={label}
      title="Drag to resize · double-click to reset"
      onPointerDown={(e) => {
        dragging.current = true;
        setActive(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        document.body.style.userSelect = 'none';
        document.body.style.cursor = isVertical ? 'col-resize' : 'row-resize';
        e.preventDefault();
      }}
      onPointerMove={(e) => dragging.current && onDrag(e.clientX, e.clientY)}
      onPointerUp={stop}
      onPointerCancel={stop}
      onDoubleClick={onReset}
      sx={(t) => ({
        flexShrink: 0,
        position: 'relative',
        touchAction: 'none',
        cursor: isVertical ? 'col-resize' : 'row-resize',
        width: isVertical ? 12 : '100%',
        height: isVertical ? 'auto' : 8,
        zIndex: 2,
        // visible grip line, centred in the hit area
        '&::after': {
          content: '""',
          position: 'absolute',
          borderRadius: 999,
          transition: 'background-color .15s, width .15s, height .15s',
          backgroundColor: active ? t.palette.primary.main : 'transparent',
          ...(isVertical
            ? { top: '50%', left: '50%', width: 4, height: 48, transform: 'translate(-50%, -50%)' }
            : { left: '50%', top: '50%', height: 4, width: 48, transform: 'translate(-50%, -50%)' }),
        },
        '&:hover::after': { backgroundColor: active ? t.palette.primary.main : alpha(t.palette.text.primary, 0.3) },
      })}
    />
  );
}
