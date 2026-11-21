import { Box, Button } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';

// Previous on the left; Practice, Test and Next share one equal-width group on the right so the three line up.
// Practice and Test cover only the open topic and stay disabled while the topic has no questions.
export default function TopicFooter({ hasPrevious, hasNext, hasQuestions, onPrevious, onPractice, onTest, onNext }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, pt: 3, pb: 6 }}>
      <Button disabled={!hasPrevious} startIcon={<ArrowBackRoundedIcon />} onClick={onPrevious}>Previous</Button>
      <Box sx={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: '1fr', gap: 1.5 }}>
        <Button variant="outlined" disabled={!hasQuestions} startIcon={<CodeRoundedIcon />} onClick={onPractice}>Practice</Button>
        <Button variant="outlined" disabled={!hasQuestions} startIcon={<TimerRoundedIcon />} onClick={onTest}>Test</Button>
        <Button variant="contained" disableElevation disabled={!hasNext} endIcon={<ArrowForwardRoundedIcon />} onClick={onNext}>Next</Button>
      </Box>
    </Box>
  );
}
