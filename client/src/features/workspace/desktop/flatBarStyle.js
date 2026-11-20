import { alpha } from '@mui/material/styles';
import { FONT_SIZES } from '../../../app/design/designTokens';

// Desktop pane bars (problem tabs, editor toolbar): every icon button and the language picker use one icon size,
// and the picker has no grey fill. It is applied on the bar, so each control keeps its own component.
export const flatBarSx = (t) => ({
  '& .MuiIconButton-root svg, & .MuiInputBase-root svg': { fontSize: FONT_SIZES.iconCompact },
  '& .MuiInputBase-root': { bgcolor: 'transparent', '&:hover': { bgcolor: alpha(t.palette.text.primary, 0.06) } },
});
