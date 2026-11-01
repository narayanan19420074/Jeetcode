import { Button, CircularProgress } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

// Primary action. While the next card is being prepared it shows a spinner instead of the label
// and ignores taps, so an answer cannot be sent twice.
export default function ContinueButton({ label = 'Continue', isLoading, isDisabled, onClick }) {
  return (
    <Button
      fullWidth
      size="large"
      variant="contained"
      disableElevation
      disabled={isDisabled || isLoading}
      aria-busy={isLoading}
      endIcon={isLoading ? null : <ArrowForwardRoundedIcon />}
      onClick={onClick}
      sx={{ minHeight: 52, borderRadius: '14px' }}
    >
      {isLoading ? <CircularProgress size={22} color="inherit" aria-label="Loading" /> : label}
    </Button>
  );
}
