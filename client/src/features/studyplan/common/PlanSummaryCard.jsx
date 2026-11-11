import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import { withAlpha, COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
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

const titleSx = { fontSize: FONT_SIZES.heading, lineHeight: 1.3, fontWeight: FONT_WEIGHTS.bold, overflowWrap: 'anywhere' };
const softTextSx = { fontSize: FONT_SIZES.body, color: withAlpha(COLOR_PALETTE.white, 0.86) };

// Buttons sit on the coloured card: View plan is solid white, Delete is a see-through pill like the Dashboard promo cards.
const viewButtonSx = (color) => ({ ...libCompactTintBtnSx, bgcolor: COLOR_PALETTE.white, color, '&:hover': { bgcolor: COLOR_PALETTE.white, filter: 'brightness(0.95)' } });
const deleteButtonSx = { ...libCompactTintBtnSx, bgcolor: withAlpha(COLOR_PALETTE.white, 0.2), color: COLOR_PALETTE.white, '&:hover': { bgcolor: withAlpha(COLOR_PALETTE.white, 0.3) } };

const questionsLeftLabel = ({ total, done }) => {
  const left = total - done;
  if (left <= 0) return 'All questions solved';
  return `${left} ${left === 1 ? 'question' : 'questions'} left`;
};

function CardHeader({ plan, onShare }) {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={1}>
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography component="h3" sx={titleSx}>{plan.title}</Typography>
        <Typography sx={{ ...softTextSx, mt: 0.5 }}>{fmtRange(plan.summary.startDate, plan.summary.endDate)}</Typography>
      </Box>
      <IconButton aria-label={`Share ${plan.title}`} onClick={(event) => onShare(event.currentTarget)} sx={{ color: COLOR_PALETTE.white, mt: -0.5, mr: -0.5 }}>
        <ShareRoundedIcon />
      </IconButton>
    </Stack>
  );
}

// A study plan on the Study Plan page: name, dates and a share button, everyone's progress on one bar with the questions
// still left, then View plan and Delete (members who are not the owner can only leave).
export default function PlanSummaryCard({ plan, onOpen, onDelete, onShare }) {
  const color = planCardColor(plan.id);
  return (
    <Box component="article" sx={cardSx(color)}>
      <CardHeader plan={plan} onShare={onShare} />
      <Box sx={{ mt: 2 }}>
        <PlanProgressBar members={plan.members} percent={plan.summary.percent} />
      </Box>
      <Typography sx={{ ...softTextSx, mt: 0.5, fontWeight: FONT_WEIGHTS.semibold }}>{questionsLeftLabel(plan.summary)}</Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button onClick={onOpen} disableElevation sx={viewButtonSx(color)}>View plan</Button>
        <Button onClick={() => onDelete(plan)} disableElevation sx={deleteButtonSx}>{plan.isOwner ? 'Delete' : 'Leave'}</Button>
      </Stack>
    </Box>
  );
}
