import { Box, ButtonBase, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import KeyboardTabRoundedIcon from '@mui/icons-material/KeyboardTabRounded';
import FormatIndentDecreaseRoundedIcon from '@mui/icons-material/FormatIndentDecreaseRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';

// Phone keyboards have no Tab key and bury symbols two layers deep. This strip
// sits right above the keyboard (like Replit / Acode / Termux "extra keys"):
// Tab + outdent on the left, undo / redo on the right, symbols scroll between.
const SYMBOLS = [':', '(', ')', '[', ']', '{', '}', '"', "'", '=', '+', '-', '*', '/', '%', '<', '>', ',', '.', '_', '#', '&', '|', '!', ';'];

// Keep the editor focused (and the keyboard open) when a key is tapped.
const keepFocus = (e) => e.preventDefault();

function Key({ children, onPress, label, wide }) {
  return (
    <ButtonBase
      aria-label={label}
      tabIndex={-1}
      onPointerDown={keepFocus}
      onMouseDown={keepFocus}
      onClick={onPress}
      sx={(t) => ({
        flexShrink: 0,
        minWidth: wide ? 44 : 36,
        height: 34,
        px: 0.75,
        borderRadius: '8px',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: '1rem',
        fontWeight: 600,
        color: 'text.primary',
        bgcolor: alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.16 : 0.09),
        '&:active': { bgcolor: alpha(t.palette.primary.main, 0.3) },
        '& svg': { fontSize: 20 },
      })}
    >
      {children}
    </ButtonBase>
  );
}

export default function MobileKeyBar({ onKey, onTab, onOutdent, onUndo, onRedo }) {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', gap: 0.5, px: 0.75, py: 0.5, flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Key label="Indent (Tab)" wide onPress={onTab}>
        <KeyboardTabRoundedIcon />
      </Key>
      <Key label="Outdent" wide onPress={onOutdent}>
        <FormatIndentDecreaseRoundedIcon />
      </Key>
      <Box sx={{ display: 'flex', gap: 0.5, flex: 1, minWidth: 0, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        {SYMBOLS.map((s) => (
          <Key key={s} label={`Insert ${s}`} onPress={() => onKey(s)}>
            {s}
          </Key>
        ))}
      </Box>
      <Key label="Undo" onPress={onUndo}>
        <UndoRoundedIcon />
      </Key>
      <Key label="Redo" onPress={onRedo}>
        <RedoRoundedIcon />
      </Key>
    </Stack>
  );
}
