import { Box, Button } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { libSmallBtnSx, libSolidBtnSx, libTintBtnSx } from '../../../dashboard/components/libraryStyle';

const DISABLED_OPACITY = 0.5;
const disabledSx = { '&.Mui-disabled': { opacity: DISABLED_OPACITY } };
const tintSx = { ...libTintBtnSx, ...libSmallBtnSx, ...disabledSx };
const solidSx = { ...libSolidBtnSx, ...libSmallBtnSx, ...disabledSx };

// Small pill buttons of the Library design under a topic: Previous at the left edge, Next at the right edge. Practice and Test live in
// the card on the right, so they are not repeated here.
export default function TopicFooter({ hasPrevious, hasNext, onPrevious, onNext }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, pt: 3, pb: 6 }}>
      <Button disableElevation disabled={!hasPrevious} startIcon={<ArrowBackRoundedIcon />} onClick={onPrevious} sx={tintSx}>Previous</Button>
      <Button disableElevation disabled={!hasNext} endIcon={<ArrowForwardRoundedIcon />} onClick={onNext} sx={solidSx}>Next</Button>
    </Box>
  );
}
