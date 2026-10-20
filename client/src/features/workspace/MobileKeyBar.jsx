import { useEffect, useRef } from 'react';
import { Box, ButtonBase, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { wsSurface } from './workspaceTheme';
import KeyboardTabRoundedIcon from '@mui/icons-material/KeyboardTabRounded';
import FormatIndentDecreaseRoundedIcon from '@mui/icons-material/FormatIndentDecreaseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';

// Phone keyboards have no Tab key, no arrow keys and bury symbols two layers
// deep. This strip sits right above the keyboard (like Replit / Acode / Termux
// "extra keys"): Tab + Delete-line on the left, Up / Down on the right, and the
// rest scrolls in between. Arrow keys repeat while held.
const SYMBOLS = [':', '(', ')', '[', ']', '{', '}', '"', "'", '=', '+', '-', '*', '/', '%', '<', '>', ',', '.', '_', '#', '&', '|', '!', ';'];

// Keep the editor focused (and the keyboard open) when a key is tapped.
const keepFocus = (e) => e.preventDefault();

function Key({ children, onPress, label, wide, repeat, danger }) {
  const delay = useRef(null);
  const timer = useRef(null);
  const stop = () => {
    clearTimeout(delay.current);
    clearInterval(timer.current);
  };
  useEffect(() => stop, []);

  const handlers = repeat
    ? {
        onPointerDown: (e) => {
          keepFocus(e);
          e.currentTarget.setPointerCapture?.(e.pointerId);
          onPress();
          delay.current = setTimeout(() => {
            timer.current = setInterval(onPress, 70);
          }, 350);
        },
        onPointerUp: stop,
        onPointerCancel: stop,
        onLostPointerCapture: stop,
      }
    : { onPointerDown: keepFocus, onClick: onPress };

  return (
    <ButtonBase
      aria-label={label}
      tabIndex={-1}
      onMouseDown={keepFocus}
      onContextMenu={(e) => e.preventDefault()}
      {...handlers}
      sx={(t) => {
        const c = danger ? t.palette.error.main : t.palette.primary.main;
        return {
          flexShrink: 0,
          minWidth: wide ? 42 : 34,
          height: 34,
          px: 0.5,
          borderRadius: '8px',
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontSize: '1rem',
          fontWeight: 600,
          color: danger ? 'error.main' : 'text.primary',
          bgcolor: danger ? alpha(c, t.palette.mode === 'dark' ? 0.18 : 0.1) : wsSurface(t).raised,
          userSelect: 'none',
          WebkitTouchCallout: 'none',
          touchAction: 'manipulation',
          '&:active': { bgcolor: alpha(c, 0.32) },
          '& svg': { fontSize: 20 },
        };
      }}
    >
      {children}
    </ButtonBase>
  );
}

export default function MobileKeyBar({ onKey, onTab, onOutdent, onDeleteLine, onUp, onDown, onLeft, onRight, onUndo, onRedo }) {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', gap: 0.5, px: 0.75, py: 0.5, flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Key label="Indent (Tab)" wide onPress={onTab}>
        <KeyboardTabRoundedIcon />
      </Key>
      <Key label="Delete line" wide danger onPress={onDeleteLine}>
        <DeleteOutlineRoundedIcon />
      </Key>
      <Box sx={{ display: 'flex', gap: 0.5, flex: 1, minWidth: 0, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        <Key label="Outdent" onPress={onOutdent}>
          <FormatIndentDecreaseRoundedIcon />
        </Key>
        <Key label="Cursor left" repeat onPress={onLeft}>
          <KeyboardArrowLeftRoundedIcon />
        </Key>
        <Key label="Cursor right" repeat onPress={onRight}>
          <KeyboardArrowRightRoundedIcon />
        </Key>
        <Key label="Undo" onPress={onUndo}>
          <UndoRoundedIcon />
        </Key>
        <Key label="Redo" onPress={onRedo}>
          <RedoRoundedIcon />
        </Key>
        {SYMBOLS.map((s) => (
          <Key key={s} label={`Insert ${s}`} onPress={() => onKey(s)}>
            {s}
          </Key>
        ))}
      </Box>
      <Key label="Line up" repeat wide onPress={onUp}>
        <KeyboardArrowUpRoundedIcon />
      </Key>
      <Key label="Line down" repeat wide onPress={onDown}>
        <KeyboardArrowDownRoundedIcon />
      </Key>
    </Stack>
  );
}
