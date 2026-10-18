import { useRef, useState } from 'react';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Draggable divider for resizable split panes (like ChatGPT / Claude / LeetCode).
 *
 * It takes NO space in the layout: the two panes sit flush against each other
 * and this is an invisible hit area laid over the seam. A thin accent line
 * appears only while hovering / dragging.
 *
 * orientation="vertical"   -> seam between side-by-side panes (drag left/right)
 * orientation="horizontal" -> seam between stacked panes (drag up/down)
 *
 * onDrag(clientX, clientY) fires while dragging; the parent turns the pointer
 * position into a size. Double-click calls onReset.
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
      sx={{
        flexShrink: 0,
        position: 'relative',
        zIndex: 3,
        ...(isVertical ? { width: 0, alignSelf: 'stretch' } : { height: 0, width: '100%' }),
      }}
    >
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
          position: 'absolute',
          touchAction: 'none',
          cursor: isVertical ? 'col-resize' : 'row-resize',
          ...(isVertical ? { top: 0, bottom: 0, left: -1, width: 7 } : { left: 0, right: 0, top: -2, height: 6 }),
          '&::after': {
            content: '""',
            position: 'absolute',
            backgroundColor: active ? t.palette.primary.main : 'transparent',
            transition: 'background-color .15s',
            ...(isVertical
              ? { top: 0, bottom: 0, left: 0, width: 2 }
              : { left: 0, right: 0, top: 1, height: 2 }),
          },
          '&:hover::after': { backgroundColor: active ? t.palette.primary.main : alpha(t.palette.primary.main, 0.6) },
        })}
      />
    </Box>
  );
}
