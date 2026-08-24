import { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, Button, IconButton, Tooltip } from '@mui/material';
import BackspaceRoundedIcon from '@mui/icons-material/BackspaceRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';

// --- Basic calculator -------------------------------------------------
// A button-press state machine (running value + pending operator), same
// model as a physical four-function calculator. Deliberately NOT built on
// eval()/new Function() — there's no reason to ever execute a string as
// code here, even though in this case the "string" could only ever come
// from the button grid itself.
//
// Layout: plain CSS Grid via Box sx={{ display: 'grid' }} instead of MUI
// <Grid item xs={N}>. The MUI Grid API changed between major versions
// (item/xs props vs the new `size` prop) and this button grid is a fixed
// 4-column layout with no responsive breakpoints — CSS Grid is the
// simpler, version-proof tool for that job. The "0" button spans 2
// columns via gridColumn: 'span 2'.
//
// v2 changes:
// - Calculation history (below the keypad) — each "=" press logs
//   "a op b = result", most recent on top, capped at 20 entries.
// - Hover/active states were relying on unstyled MUI defaults, which made
//   digit keys (outlined, default "primary" color) and operator keys
//   (contained, "primary") look nearly identical and gave no visible
//   press feedback. Keys are now explicitly grouped by role (digit /
//   operator / function) with distinct neutral vs. accent styling, an
//   explicit hover background, and an `:active` press-down effect.
// - Physical keyboard input: digits, '.', +-*/, Enter/'=', Backspace,
//   Escape/'c' all drive the same state machine as the on-screen buttons.
//   Ignored while focus is inside a real text input/textarea elsewhere on
//   the page, so it doesn't hijack typing outside the calculator.
const HISTORY_LIMIT = 20;

function Calculator() {
  const [display, setDisplay] = useState('0');
  const [storedValue, setStoredValue] = useState(null);
  const [pendingOp, setPendingOp] = useState(null);
  const [overwrite, setOverwrite] = useState(true);
  const [history, setHistory] = useState([]); // [{ expression, result }], newest first

  // Refs mirror the latest state for the keydown listener, which is only
  // ever attached once — avoids re-binding on every keystroke.
  const stateRef = useRef();
  stateRef.current = { display, storedValue, pendingOp, overwrite };

  const compute = (a, b, op) => {
    switch (op) {
      case '+':
        return a + b;
      case '−':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  };

  const pressDigit = (d) => {
    setDisplay((prev) => {
      if (overwrite) return d;
      if (prev === '0') return d;
      return prev.length >= 12 ? prev : prev + d;
    });
    setOverwrite(false);
  };

  const pressDecimal = () => {
    setDisplay((prev) => (overwrite ? '0.' : prev.includes('.') ? prev : prev + '.'));
    setOverwrite(false);
  };

  const pressOperator = (op) => {
    const current = parseFloat(display);
    if (storedValue !== null && pendingOp && !overwrite) {
      const result = compute(storedValue, current, pendingOp);
      setStoredValue(result);
      setDisplay(String(result));
    } else {
      setStoredValue(current);
    }
    setPendingOp(op);
    setOverwrite(true);
  };

  const pressEquals = () => {
    if (pendingOp === null || storedValue === null) return;
    const current = parseFloat(display);
    const result = compute(storedValue, current, pendingOp);
    const resultStr = Number.isNaN(result) ? 'Error' : String(result);

    setHistory((prev) => {
      const entry = { expression: `${storedValue} ${pendingOp} ${current}`, result: resultStr };
      return [entry, ...prev].slice(0, HISTORY_LIMIT);
    });

    setDisplay(resultStr);
    setStoredValue(null);
    setPendingOp(null);
    setOverwrite(true);
  };

  const pressClear = () => {
    setDisplay('0');
    setStoredValue(null);
    setPendingOp(null);
    setOverwrite(true);
  };

  const clearHistory = () => setHistory([]);

  const pressBackspace = () => {
    setDisplay((prev) => {
      if (overwrite || prev.length <= 1 || (prev.length === 2 && prev.startsWith('-'))) return '0';
      return prev.slice(0, -1);
    });
  };

  const pressToggleSign = () => {
    setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : prev === '0' ? prev : `-${prev}`));
  };

  // --- Physical keyboard support ---
  useEffect(() => {
    const KEY_TO_OP = { '+': '+', '-': '−', '*': '×', '/': '÷' };

    const handleKeyDown = (e) => {
      const target = e.target;
      const isTypingElsewhere =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (isTypingElsewhere) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        pressDigit(e.key);
        return;
      }
      if (e.key === '.') {
        e.preventDefault();
        pressDecimal();
        return;
      }
      if (KEY_TO_OP[e.key]) {
        e.preventDefault();
        pressOperator(KEY_TO_OP[e.key]);
        return;
      }
      if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        pressEquals();
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        pressBackspace();
        return;
      }
      if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        pressClear();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // Handlers close over state via stateRef-backed setters (functional
    // updates), so this can safely mount once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Button styling ---
  // Distinct role-based styling so hover/active feedback is actually
  // visible: neutral slate keys for digits, primary-accent for operators,
  // outlined-error for destructive actions.
  const baseBtnSx = {
    minWidth: 0,
    height: 36,
    fontWeight: 600,
    borderRadius: 1,
    transition: 'transform 0.08s ease, background-color 0.12s ease',
    '&:active': { transform: 'scale(0.94)' },
  };

  const digitBtnSx = {
    ...baseBtnSx,
    color: 'text.primary',
    borderColor: 'divider',
    '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' },
  };

  const operatorBtnSx = {
    ...baseBtnSx,
    '&:hover': { bgcolor: 'primary.dark' },
  };

  const functionBtnSx = {
    ...baseBtnSx,
    color: 'text.secondary',
    borderColor: 'divider',
    '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' },
  };

  const clearBtnSx = {
    ...baseBtnSx,
    '&:hover': { bgcolor: 'error.50', borderColor: 'error.main' },
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Calculator
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 1,
          mb: 1,
          borderRadius: 1,
          textAlign: 'right',
          fontFamily: 'monospace',
          fontSize: '1.1rem',
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {display}
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.75 }}>
        <Button fullWidth variant="outlined" color="error" sx={clearBtnSx} onClick={pressClear}>
          C
        </Button>
        <Button fullWidth variant="outlined" sx={functionBtnSx} onClick={pressToggleSign}>
          ±
        </Button>
        <Button fullWidth variant="outlined" sx={functionBtnSx} onClick={pressBackspace}>
          <BackspaceRoundedIcon fontSize="small" />
        </Button>
        <Button fullWidth variant="contained" sx={operatorBtnSx} onClick={() => pressOperator('÷')}>
          ÷
        </Button>

        {['7', '8', '9'].map((d) => (
          <Button key={d} fullWidth variant="outlined" sx={digitBtnSx} onClick={() => pressDigit(d)}>
            {d}
          </Button>
        ))}
        <Button fullWidth variant="contained" sx={operatorBtnSx} onClick={() => pressOperator('×')}>
          ×
        </Button>

        {['4', '5', '6'].map((d) => (
          <Button key={d} fullWidth variant="outlined" sx={digitBtnSx} onClick={() => pressDigit(d)}>
            {d}
          </Button>
        ))}
        <Button fullWidth variant="contained" sx={operatorBtnSx} onClick={() => pressOperator('−')}>
          −
        </Button>

        {['1', '2', '3'].map((d) => (
          <Button key={d} fullWidth variant="outlined" sx={digitBtnSx} onClick={() => pressDigit(d)}>
            {d}
          </Button>
        ))}
        <Button fullWidth variant="contained" sx={operatorBtnSx} onClick={() => pressOperator('+')}>
          +
        </Button>

        <Button
          fullWidth
          variant="outlined"
          sx={{ ...digitBtnSx, gridColumn: 'span 2' }}
          onClick={() => pressDigit('0')}
        >
          0
        </Button>
        <Button fullWidth variant="outlined" sx={digitBtnSx} onClick={pressDecimal}>
          .
        </Button>
        <Button fullWidth variant="contained" color="success" sx={operatorBtnSx} onClick={pressEquals}>
          =
        </Button>
      </Box>

      {/* --- History --- */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            History
          </Typography>
          {history.length > 0 && (
            <Tooltip title="Clear history">
              <IconButton size="small" onClick={clearHistory}>
                <DeleteSweepRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Paper
          variant="outlined"
          sx={{
            borderRadius: 1,
            maxHeight: 140,
            overflowY: 'auto',
            bgcolor: 'action.hover',
          }}
        >
          {history.length === 0 ? (
            <Typography variant="caption" sx={{ display: 'block', p: 1.25, color: 'text.disabled' }}>
              No calculations yet
            </Typography>
          ) : (
            history.map((entry, idx) => (
              <Box
                key={idx}
                sx={{
                  px: 1.25,
                  py: 0.75,
                  borderBottom: idx < history.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ display: 'block', fontFamily: 'monospace', color: 'text.secondary' }}
                >
                  {entry.expression} =
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  {entry.result}
                </Typography>
              </Box>
            ))
          )}
        </Paper>
      </Box>
    </Box>
  );
}

// --- Panel shell ------------------------------------------------------
export default function ScratchPad() {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
      <Calculator />
    </Paper>
  );
}
