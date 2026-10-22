import { useRef, useState } from 'react';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Draggable divider for resizable split panes.
 *
 * It takes NO space in the layout: the two panes sit flush against each other
 * and this is a thin hit area laid over the seam. It draws the ONE hairline
 * that separates the panes; the accent bar shows on hover / while dragging.
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
          ...(isVertical ? { top: 0, bottom: 0, left: -4, width: 9 } : { left: 0, right: 0, top: -4, height: 9 }),
          // the single hairline between the panes
          '&::before': {
            content: '""',
            position: 'absolute',
            backgroundColor: t.palette.divider,
            ...(isVertical ? { top: 0, bottom: 0, left: 4, width: 1 } : { left: 0, right: 0, top: 4, height: 1 }),
          },
          // accent bar on hover / drag
          '&::after': {
            content: '""',
            position: 'absolute',
            borderRadius: 2,
            backgroundColor: active ? t.palette.primary.main : 'transparent',
            transition: 'background-color .15s',
            ...(isVertical ? { top: 0, bottom: 0, left: 3, width: 3 } : { left: 0, right: 0, top: 3, height: 3 }),
          },
          '&:hover::after': { backgroundColor: active ? t.palette.primary.main : alpha(t.palette.primary.main, 0.6) },
        })}
      />
    </Box>
  );
}
