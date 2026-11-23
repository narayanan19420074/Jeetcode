import { Box, ButtonBase, Typography } from '@mui/material';
import BackToDashboard from '../../../components/BackToDashboard';
import { useLibraryCardSx } from '../../dashboard/components/libraryCardStyles';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { tint } from '../../dashboard/dashboardUtils';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const BROWSE_OPTIONS = [{ value: 'courses', label: 'Courses' }, { value: 'lessons', label: 'Lessons' }];
// The selected row is a soft tint of the card's own text colour, so it reads in light and dark mode.
const SELECTED_BG = tint('currentColor', 12);
const UNSELECTED_OPACITY = 0.72;

function BrowseRow({ option, selected, onPick }) {
  return (
    <ButtonBase onClick={() => onPick(option.value)} aria-pressed={selected} sx={{ justifyContent: 'flex-start', width: SIZES.fill, px: 1.5, py: 1.25, borderRadius: RADII_PX.card, fontFamily: 'inherit', bgcolor: selected ? SELECTED_BG : 'transparent', opacity: selected ? 1 : UNSELECTED_OPACITY }}>
      <Typography noWrap sx={{ fontWeight: selected ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, letterSpacing: LIB_TRACKING }}>{option.label}</Typography>
    </ButtonBase>
  );
}

// Left column of the Courses page: the way back and the two lists, on the same card as the Problems and Aptitude sidebars.
export default function CoursesSidebar({ tab, onPick }) {
  const cardSx = useLibraryCardSx();
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box><BackToDashboard /></Box>
      <Box role="group" aria-label="Browse" sx={{ ...cardSx, p: 1, gap: 0.5 }}>
        {BROWSE_OPTIONS.map((option) => <BrowseRow key={option.value} option={option} selected={option.value === tab} onPick={onPick} />)}
      </Box>
    </Box>
  );
}
