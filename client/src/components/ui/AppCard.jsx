import { Paper } from '@mui/material';
import { LAYOUT_SPACING, MOTION, RADII_PX } from '../../app/design/designTokens';

// A neutral tonal layer drawn over the card's own background, so hover, pressed and selected look the same
// in light and dark mode and on every surface colour.
const tonalLayer = (color) => ({ backgroundImage: `linear-gradient(${color}, ${color})` });

// Clickable cards behave like every other clickable surface: hover tint, deeper tint while pressed.
const interactiveSx = (theme) => ({
  cursor: 'pointer',
  color: 'inherit',
  textDecoration: 'none',
  transition: theme.transitions.create(['background-color', 'border-color'], { duration: MOTION.fast }),
  '&:hover': tonalLayer(theme.palette.action.hover),
  '&:active': tonalLayer(theme.palette.action.selected),
});

// A selected card keeps the pressed tint and gets a primary border, the same cue as selected rows and tabs.
const selectedSx = (theme) => ({
  borderColor: theme.palette.primary.main,
  ...tonalLayer(theme.palette.action.selected),
  '&:hover': tonalLayer(theme.palette.action.selected),
});

const cardSx = ({ interactive, selected, padded }) => (theme) => ({
  borderRadius: RADII_PX.card,
  minWidth: 0,
  ...(padded && { p: LAYOUT_SPACING.cardPadding }),
  ...(interactive && interactiveSx(theme)),
  ...(selected && selectedSx(theme)),
});

// Standard surface for grouped content: flat, 1px border, one radius and one padding on every page.
// Set `interactive` for cards that open something and render them as a link or button
// (for example `component={RouterLink} to="/path"`) so they work with the keyboard.
export default function AppCard({ interactive = false, selected = false, padded = true, sx, ...paperProps }) {
  return <Paper variant="outlined" sx={[cardSx({ interactive, selected, padded }), ...[].concat(sx ?? [])]} {...paperProps} />;
}
