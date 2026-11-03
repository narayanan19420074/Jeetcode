import { Box } from '@mui/material';
import { MOTION, RADII_PX, SIZES } from '../../app/design/designTokens';

// Hover and pressed use the same two neutral tints as every other clickable surface (see STATES).
const interactiveSx = (theme) => ({
  cursor: 'pointer',
  color: 'inherit',
  textDecoration: 'none',
  transition: theme.transitions.create('background-color', { duration: MOTION.fast }),
  '&:hover': { bgcolor: theme.palette.action.hover },
  '&:active': { bgcolor: theme.palette.action.selected },
});

const rowSx = ({ striped, interactive, selected, dense }) => (theme) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  minWidth: 0,
  px: 1.5,
  minHeight: dense ? SIZES.listRowHeightDense : SIZES.listRowHeight,
  borderRadius: RADII_PX.control,
  ...(striped && { bgcolor: theme.palette.action.stripe }),
  ...(interactive && interactiveSx(theme)),
  ...(selected && { bgcolor: theme.palette.action.selected, fontWeight: 'fontWeightSemibold' }),
});

// One row of a list: fixed height, a faint zebra stripe on alternate rows (`striped`), and the shared
// hover, pressed and selected behaviour. Render clickable rows as a link or button through `component`.
export default function ListRow({ striped = false, interactive = false, selected = false, dense = false, sx, ...boxProps }) {
  return <Box sx={[rowSx({ striped, interactive, selected, dense }), ...[].concat(sx ?? [])]} {...boxProps} />;
}
