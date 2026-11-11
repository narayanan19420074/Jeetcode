import { Box, Button, Stack, Typography } from '@mui/material';
import { withAlpha, COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';
import { libCompactTintBtnSx } from '../../dashboard/components/libraryStyle';
import { fmtRange } from '../planUtils';
import { planCardColor } from './planCardColors';
import PlanProgressBar from './PlanProgressBar';

const cardSx = (color) => ({
  p: 2,
  borderRadius: RADII_PX.card,
  bgcolor: color,
  color: COLOR_PALETTE.white,
});

const titleSx = { fontSize: FONT_SIZES.heading, lineHeight: '24px', fontWeight: FONT_WEIGHTS.bold, overflowWrap: 'anywhere' };

// Buttons sit on the coloured card: View plan is solid white, Delete is a see-through pill like the Dashboard promo cards.
const viewButtonSx = (color) => ({ ...libCompactTintBtnSx, bgcolor: COLOR_PALETTE.white, color, '&:hover': { bgcolor: COLOR_PALETTE.white, filter: 'brightness(0.95)' } });
const deleteButtonSx = { ...libCompactTintBtnSx, bgcolor: withAlpha(COLOR_PALETTE.white, 0.2), color: COLOR_PALETTE.white, '&:hover': { bgcolor: withAlpha(COLOR_PALETTE.white, 0.3) } };

// A study plan on the Study Plan page: name, dates, everyone's progress on one bar, then View plan and Delete
// (members who are not the owner can only leave).
export default function PlanSummaryCard({ plan, onOpen, onDelete }) {
  const { summary, members, isOwner, title } = plan;
  const color = planCardColor(plan.id);
  return (
    <Box component="article" sx={cardSx(color)}>
      <Typography component="h3" sx={titleSx}>{title}</Typography>
      <Typography sx={{ mt: 0.5, fontSize: FONT_SIZES.body, color: withAlpha(COLOR_PALETTE.white, 0.86) }}>{fmtRange(summary.startDate, summary.endDate)}</Typography>
      <Box sx={{ mt: 2 }}>
        <PlanProgressBar members={members} percent={summary.percent} />
      </Box>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button onClick={onOpen} disableElevation sx={viewButtonSx(color)}>View plan</Button>
        <Button onClick={() => onDelete(plan)} disableElevation sx={deleteButtonSx}>{isOwner ? 'Delete' : 'Leave'}</Button>
      </Stack>
    </Box>
  );
}
