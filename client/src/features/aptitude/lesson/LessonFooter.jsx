import { Button, Stack } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

// Previous and next buttons under a lesson. The last next button leads to practice, which is where learning continues.
export default function LessonFooter({ hasPrevious, isLast, questionCount, onPrevious, onPractice, onNext }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', pt: 3, pb: 6 }}>
      <Button disabled={!hasPrevious} startIcon={<ArrowBackRoundedIcon />} onClick={onPrevious}>Previous</Button>
      <Stack direction="row" spacing={1.5}>
        {questionCount > 0 && <Button variant="outlined" onClick={onPractice}>Practise this topic ({questionCount})</Button>}
        <Button variant="contained" disableElevation endIcon={<ArrowForwardRoundedIcon />} onClick={onNext}>{isLast ? 'Start practising' : 'Next'}</Button>
      </Stack>
    </Stack>
  );
}
