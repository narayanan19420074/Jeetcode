import { Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { FONT_WEIGHTS } from '../../app/design/designTokens';

// "Undo" action shown on the snackbar after Fix replaces the learner's code.
export default function FixUndoButton({ snackbarKey, onUndo }) {
  const { closeSnackbar } = useSnackbar();

  const handleClick = () => {
    onUndo();
    closeSnackbar(snackbarKey);
  };

  return (
    <Button color="inherit" size="small" onClick={handleClick} sx={{ fontWeight: FONT_WEIGHTS.bold }}>
      Undo
    </Button>
  );
}
