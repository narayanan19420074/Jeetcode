import { ButtonBase, Stack } from '@mui/material';
import { FONT_SIZES, RADII_PX } from '../../../../../app/design/designTokens';
import { LIB_ACCENT, LIB_TRACKING } from '../../../../dashboard/components/libraryStyle';

const QUICK_REPLIES = ['How are you?', 'Have a nice day', 'Want to practise together?'];

const chipSx = { flexShrink: 0, px: 2, py: 1, borderRadius: RADII_PX.pill, border: '1.5px solid', borderColor: LIB_ACCENT, color: LIB_ACCENT, fontFamily: 'inherit', fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING, whiteSpace: 'nowrap' };

// One-tap openers above the composer, shown while the message field is empty. A tap sends the text straight away.
export default function QuickReplies({ onPick }) {
  return (
    <Stack direction="row" role="group" aria-label="Quick replies" sx={{ gap: 1, px: 2, pt: 1, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
      {QUICK_REPLIES.map((reply) => <ButtonBase key={reply} onClick={() => onPick(reply)} sx={chipSx}>{reply}</ButtonBase>)}
    </Stack>
  );
}
