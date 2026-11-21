import { Box, Button } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import { libCompactSolidBtnSx, libCompactTintBtnSx } from '../../../dashboard/components/libraryStyle';

const DISABLED_OPACITY = 0.5;
const disabledSx = { '&.Mui-disabled': { opacity: DISABLED_OPACITY } };
const tintSx = { ...libCompactTintBtnSx, ...disabledSx };
const solidSx = { ...libCompactSolidBtnSx, ...disabledSx };

// Pill buttons of the Library design. Previous on the left; Practice, Test and Next share one equal-width group on
// the right so the three line up. Practice and Test cover only the open topic and stay disabled while it has no questions.
export default function TopicFooter({ hasPrevious, hasNext, hasQuestions, onPrevious, onPractice, onTest, onNext }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, pt: 3, pb: 6 }}>
      <Button disableElevation disabled={!hasPrevious} startIcon={<ArrowBackRoundedIcon />} onClick={onPrevious} sx={tintSx}>Previous</Button>
      <Box sx={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: '1fr', gap: 1.5 }}>
        <Button disableElevation disabled={!hasQuestions} startIcon={<CodeRoundedIcon />} onClick={onPractice} sx={tintSx}>Practice</Button>
        <Button disableElevation disabled={!hasQuestions} startIcon={<TimerRoundedIcon />} onClick={onTest} sx={tintSx}>Test</Button>
        <Button disableElevation disabled={!hasNext} endIcon={<ArrowForwardRoundedIcon />} onClick={onNext} sx={solidSx}>Next</Button>
      </Box>
    </Box>
  );
}
