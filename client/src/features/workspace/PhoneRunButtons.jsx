import { Button, CircularProgress } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import { tint } from '../dashboard/dashboardUtils';
import { keepFocus } from './RunSubmitButtons';
import { PHONE_ACCENT } from './wsTokens';

// Run / Submit in the phone console bar: the same pill buttons as "Practice" and "Daily" on the
// phone Problems page. Tapping them must not drop the keyboard mid-tap.
const pill = {
  height: 44,
  px: 2.25,
  minWidth: 0,
  borderRadius: 999,
  fontWeight: 800,
  fontSize: '0.95rem',
  lineHeight: 1,
  textTransform: 'none',
  whiteSpace: 'nowrap',
  '& .MuiButton-startIcon': { mr: 0.75, ml: -0.5 },
  '& .MuiButton-startIcon svg': { fontSize: 20 },
};

export function PhoneRunButton({ loading, disabled, onClick }) {
  return (
    <Button
      disableElevation
      variant="contained"
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PlayArrowRoundedIcon />}
      onPointerDown={keepFocus}
      onMouseDown={keepFocus}
      onClick={onClick}
      sx={{ ...pill, bgcolor: tint(PHONE_ACCENT, 20), color: PHONE_ACCENT, '&:hover': { bgcolor: tint(PHONE_ACCENT, 30) } }}
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
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadRoundedIcon />}
      onPointerDown={keepFocus}
      onMouseDown={keepFocus}
      onClick={onClick}
      sx={{ ...pill, bgcolor: PHONE_ACCENT, color: '#fff', '&:hover': { bgcolor: `color-mix(in srgb, ${PHONE_ACCENT} 85%, #000)` } }}
    >
      Submit
    </Button>
  );
}
