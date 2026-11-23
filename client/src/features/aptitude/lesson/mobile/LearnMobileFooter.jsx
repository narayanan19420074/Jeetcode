import { Button, Stack } from '@mui/material';
import { libSolidBtnSx, libTintBtnSx } from '../../../dashboard/components/libraryStyle';
import { SIZES } from '../../../../app/design/designTokens';

const fillWidth = { width: SIZES.fill };
const halfWidth = { flex: 1 };

// Pill buttons under a phone lesson, in the Library look. Next on the last lesson leads to practice, where learning continues.
export default function LearnMobileFooter({ hasPrevious, isLast, questionCount, onPrevious, onPractice, onNext }) {
  return (
    <Stack spacing={1.5} sx={{ pt: 3, pb: 'calc(24px + env(safe-area-inset-bottom))' }}>
      {questionCount > 0 && <Button disableElevation onClick={onPractice} sx={{ ...libTintBtnSx, ...fillWidth }}>Practise this topic ({questionCount})</Button>}
      <Stack direction="row" spacing={1.5}>
        <Button disableElevation disabled={!hasPrevious} onClick={onPrevious} sx={{ ...libTintBtnSx, ...halfWidth }}>Previous</Button>
        <Button disableElevation onClick={onNext} sx={{ ...libSolidBtnSx, ...halfWidth }}>{isLast ? 'Start practising' : 'Next'}</Button>
      </Stack>
    </Stack>
  );
}
