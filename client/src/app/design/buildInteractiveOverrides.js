import { BREAKPOINTS, FONT_WEIGHTS, MOTION, RADII, SIZES } from './designTokens';

const DESKTOP_QUERY = `@media (min-width:${BREAKPOINTS.md}px)`;

// Every state change (hover, pressed, selected) uses the same colour transition, so all controls feel alike.
// Settings -> Accessibility -> Reduce motion turns theme.transitions.create into a no-op.
const stateTransition = (theme) =>
  theme.transitions.create(['background-color', 'border-color', 'color'], { duration: MOTION.fast });

// Pressed feedback is the same neutral tonal layer on every clickable surface.
const pressedFill = ({ theme }) => ({ '&:active': { backgroundColor: theme.palette.action.selected } });

// Buttons meet the touch-target height on phones and a tighter height on desktop. Compact density shrinks them.
const buttonOverrides = (compact) => ({
  defaultProps: { disableElevation: true, ...(compact && { size: 'small' }) },
  styleOverrides: {
    root: ({ theme }) => ({ borderRadius: RADII.control, paddingInline: compact ? 14 : 18, transition: stateTransition(theme) }),
    text: pressedFill,
    outlined: pressedFill,
    ...(!compact && {
      sizeMedium: { minHeight: SIZES.controlHeight.mobile, [DESKTOP_QUERY]: { minHeight: SIZES.controlHeight.desktop } },
    }),
  },
});

// Selected tab: heavier, primary-coloured text over a muted unselected label.
const tabOverrides = {
  styleOverrides: {
    root: ({ theme }) => ({
      textTransform: 'none',
      fontWeight: FONT_WEIGHTS.medium,
      transition: stateTransition(theme),
      '&.Mui-selected': { fontWeight: FONT_WEIGHTS.semibold },
    }),
  },
};

// Rows in menus, sidebars and lists: hover and selected use the neutral tonal layer, selected text gets heavier.
const listItemButtonOverrides = {
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: RADII.control,
      transition: stateTransition(theme),
      '&:active': { backgroundColor: theme.palette.action.selected },
      '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: theme.palette.action.selected },
      '&.Mui-selected': { fontWeight: FONT_WEIGHTS.semibold },
    }),
  },
};

const outlinedInputOverrides = {
  styleOverrides: { root: ({ theme }) => ({ borderRadius: RADII.control, transition: stateTransition(theme) }) },
};

// Chips and filter pills: pill shape, caption text, one height per size.
const chipOverrides = (compact) => ({
  defaultProps: compact ? { size: 'small' } : {},
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: RADII.pill,
      fontWeight: FONT_WEIGHTS.medium,
      fontSize: theme.typography.caption.fontSize,
      transition: stateTransition(theme),
    }),
    sizeMedium: { height: SIZES.chipHeight },
    sizeSmall: { height: SIZES.chipHeightSmall },
  },
});

export const buildInteractiveOverrides = (compact) => ({
  MuiButton: buttonOverrides(compact),
  MuiTab: tabOverrides,
  MuiListItemButton: listItemButtonOverrides,
  MuiOutlinedInput: outlinedInputOverrides,
  MuiChip: chipOverrides(compact),
});
