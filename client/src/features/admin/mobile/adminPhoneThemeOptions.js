import { FONT_SIZES, FONT_WEIGHTS, MOTION, RADII_PX, SIZES } from '../../../app/design/designTokens';

// Phone-only theme overrides for the admin console, following the Material Design 3 type scale and 8dp grid.
// Every admin page is built from stock MUI parts, so setting the scale and component sizes here gives all pages the same
// font sizes, tab, field, button, chip and table density without editing each page.

const type = (fontSize, lineHeight, fontWeight = FONT_WEIGHTS.regular) => ({ fontSize, lineHeight, fontWeight });

// Material roles: h4 stat value and h5 page title = headline small, h6 section title = title large, subtitle1 = title
// medium, subtitle2 and button = label large, body1 = body large, body2 = body medium, caption = body small.
const typographyOptions = {
  h4: type(FONT_SIZES.display, '32px', FONT_WEIGHTS.bold),
  h5: type(FONT_SIZES.display, '32px', FONT_WEIGHTS.bold),
  h6: type(FONT_SIZES.heading, '28px', FONT_WEIGHTS.bold),
  subtitle1: type(FONT_SIZES.title, '24px', FONT_WEIGHTS.medium),
  subtitle2: type(FONT_SIZES.body, '20px', FONT_WEIGHTS.medium),
  body1: type(FONT_SIZES.title, '24px'),
  body2: type(FONT_SIZES.body, '20px'),
  caption: type(FONT_SIZES.caption, '16px'),
  button: type(FONT_SIZES.body, '20px', FONT_WEIGHTS.medium),
  overline: type(FONT_SIZES.micro, '16px', FONT_WEIGHTS.medium),
};

const buttonTransition = (theme) =>
  theme.transitions.create(['background-color', 'border-color', 'color'], { duration: MOTION.fast });

// Material buttons are full-radius pills with a medium-weight label; height stays the app's touch target.
const buttonOverrides = {
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: RADII_PX.pill,
      textTransform: 'none',
      fontWeight: FONT_WEIGHTS.medium,
      paddingInline: theme.spacing(3),
      transition: buttonTransition(theme),
    }),
  },
};

// Outlined fields: 8dp corners, one touch-target height for every single-line field and select.
const fieldOverrides = {
  styleOverrides: {
    root: {
      borderRadius: RADII_PX.control,
      '&:not(.MuiInputBase-multiline)': { minHeight: SIZES.controlHeight.mobile },
    },
  },
};

// Primary tabs: medium-weight sentence-case label, one touch-target height.
const tabsOverrides = { styleOverrides: { root: { minHeight: SIZES.touchTarget } } };

const tabOverrides = {
  styleOverrides: {
    root: ({ theme }) => ({
      minWidth: SIZES.flexShrinkMinWidth,
      minHeight: SIZES.touchTarget,
      paddingInline: theme.spacing(2),
      textTransform: 'none',
      fontWeight: FONT_WEIGHTS.medium,
      fontSize: FONT_SIZES.body,
    }),
  },
};

// Chips: 8dp corners and a 32dp medium chip, like Material assist chips.
const chipOverrides = {
  styleOverrides: {
    root: { borderRadius: RADII_PX.control },
    sizeMedium: { height: SIZES.compactPillHeight },
  },
};

const cellPadding = ({ theme }) => ({ paddingBlock: theme.spacing(1.5), paddingInline: theme.spacing(2) });

// Table cells share one padding; the header is a medium-weight secondary-colour label.
const tableCellOverrides = {
  styleOverrides: {
    root: cellPadding,
    sizeSmall: cellPadding,
    head: ({ theme }) => ({ fontWeight: FONT_WEIGHTS.medium, color: theme.palette.text.secondary }),
  },
};

// Dialogs keep a 16dp margin to the screen edge on phones (Material compact window).
const dialogOverrides = {
  styleOverrides: {
    paper: ({ theme }) => ({ margin: theme.spacing(2), maxWidth: `calc(100% - ${theme.spacing(4)})` }),
  },
};

const menuItemOverrides = { styleOverrides: { root: { minHeight: SIZES.menuRowHeight } } };

export const adminPhoneThemeOptions = {
  typography: typographyOptions,
  components: {
    MuiButton: buttonOverrides,
    MuiOutlinedInput: fieldOverrides,
    MuiTabs: tabsOverrides,
    MuiTab: tabOverrides,
    MuiChip: chipOverrides,
    MuiTableCell: tableCellOverrides,
    MuiDialog: dialogOverrides,
    MuiMenuItem: menuItemOverrides,
  },
};
