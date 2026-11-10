import { ButtonBase, Divider, Stack } from '@mui/material';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import { navActiveColor } from '../../../../components/navbar/navLinkStyles';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../../app/design/designTokens';
import { MESSAGE_FILTERS } from './messagesSample';

const chipSx = (selected) => (theme) => ({
  height: SIZES.filterPillHeight,
  px: 2,
  flexShrink: 0,
  gap: 0.5,
  borderRadius: RADII_PX.pill,
  fontFamily: 'inherit',
  fontSize: FONT_SIZES.title,
  fontWeight: FONT_WEIGHTS.semibold,
  border: '1px solid',
  borderColor: selected ? navActiveColor(theme) : 'text.secondary',
  bgcolor: selected ? navActiveColor(theme) : 'transparent',
  color: selected ? theme.palette.common.white : 'text.secondary',
});

// The inbox picker ("Focused") followed by the filters. Display only for now.
export default function MessageFilterChips() {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1.5, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
      <ButtonBase aria-haspopup="true" sx={chipSx(true)}>
        Focused
        <ArrowDropDownRoundedIcon />
      </ButtonBase>
      <Divider orientation="vertical" flexItem />
      {MESSAGE_FILTERS.map((filter) => (
        <ButtonBase key={filter} sx={chipSx(false)}>{filter}</ButtonBase>
      ))}
    </Stack>
  );
}
