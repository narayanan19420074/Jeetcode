import { Button, CircularProgress } from '@mui/material';
import { libSolidBtnSx, libTintBtnSx } from '../dashboard/components/libraryStyle';
import { keepFocus } from './RunSubmitButtons';

// Run / Submit in the phone console bar, in the Library look: a tinted pill and an accent pill, text only
// (the same 40px pill height as "Practice" and "Daily" on the phone Problems page).
// Tapping them must not drop the keyboard mid-tap.
const size = { height: 40, px: 2.5, fontSize: 16 };

export function PhoneRunButton({ loading, disabled, onClick }) {
  return (
    <Button
      disableElevation
      variant="contained"
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
      onPointerDown={keepFocus}
      onMouseDown={keepFocus}
      onClick={onClick}
      sx={{ ...libTintBtnSx, ...size, bgcolor: 'var(--lib-bg)', '&:hover': { bgcolor: 'var(--lib-bg)', filter: 'brightness(0.97)' } }}
    >
      Run
    </Button>
  );
}

export function PhoneSubmitButton({ loading, disabled, onClick }) {
  return (
    <Button
      disableElevation
      variant="contained"
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
      onPointerDown={keepFocus}
      onMouseDown={keepFocus}
      onClick={onClick}
      sx={{ ...libSolidBtnSx, ...size }}
    >
      Submit
    </Button>
  );
}
