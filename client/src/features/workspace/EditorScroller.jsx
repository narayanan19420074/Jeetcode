import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';

// Phone fast-scroller: Monaco's own scrollbar is 6px wide, impossible to grab.
// This is a big draggable handle on the right edge (like Android's fast scroll):
// drag up to see the top of the code, drag down to reach the bottom. It only
// appears when the code is taller than the editor, and a "Ln N" bubble shows
// where you are while dragging.
const THUMB_H = 56;

export default function EditorScroller({ editor }) {
  const drag = useRef(null);
  const [m, setM] = useState({ view: 0, max: 0, top: 0, line: 1 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!editor) return undefined;
    const update = () => {
      const view = editor.getLayoutInfo().height;
      const max = Math.max(0, editor.getScrollHeight() - view);
      const r = editor.getVisibleRanges()[0];
      setM({ view, max, top: editor.getScrollTop(), line: r ? r.startLineNumber : 1 });
    };
    update();
    const subs = [editor.onDidScrollChange(update), editor.onDidContentSizeChange(update), editor.onDidLayoutChange(update)];
    return () => subs.forEach((d) => d.dispose());
  }, [editor]);

  if (!editor || m.max < 24 || m.view < THUMB_H * 2) return null;

  const travel = m.view - THUMB_H;
  const thumbTop = (m.top / m.max) * travel;
  const keep = (e) => e.preventDefault(); // don't steal focus / close the keyboard

  const onDown = (e) => {
    keep(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, top: thumbTop };
    setDragging(true);
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const next = Math.min(travel, Math.max(0, drag.current.top + (e.clientY - drag.current.y)));
    editor.setScrollTop((next / travel) * m.max);
  };
  const onUp = () => {
    drag.current = null;
    setDragging(false);
  };

  return (
    <Box
      onPointerDown={onDown}
      onMouseDown={keep}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      role="slider"
      aria-label="Scroll code"
      aria-valuemin={0}
      aria-valuemax={m.max}
      aria-valuenow={m.top}
      sx={(t) => ({
        position: 'absolute',
        right: 2,
        top: thumbTop,
        width: 22,
        height: THUMB_H,
        zIndex: 5,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '11px',
        touchAction: 'none',
        cursor: 'grab',
        color: dragging ? t.palette.primary.contrastText : t.palette.primary.main,
        bgcolor: dragging ? t.palette.primary.main : alpha(t.palette.primary.main, 0.22),
        boxShadow: dragging ? `0 2px 8px ${alpha(t.palette.primary.main, 0.45)}` : 'none',
        transition: 'background-color .15s',
        '& svg': { fontSize: 20 },
      })}
    >
      <UnfoldMoreRoundedIcon />
      {dragging && (
        <Typography
          sx={(t) => ({
            position: 'absolute',
            right: 30,
            top: '50%',
            transform: 'translateY(-50%)',
            px: 1.25,
            py: 0.4,
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            color: t.palette.primary.contrastText,
            bgcolor: t.palette.primary.main,
          })}
        >
          Ln {m.line}
        </Typography>
      )}
    </Box>
  );
}
