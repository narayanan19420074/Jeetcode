import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import { LIB_ACCENT, LIB_TRACKING } from '../../dashboard/components/libraryStyle';

// Phone-only theme overrides for the admin console. Every admin page is built from stock MUI parts (cards, tabs,
// fields, buttons, tables), so restyling those parts here gives all pages the learner Library look without editing
// each page: tracked body text, bold section titles, pill tabs, tonal pill fields and pill buttons.
// `pal` is the Library palette of the current light or dark mode.

const tracked = { letterSpacing: LIB_TRACKING };

const typographyOptions = {
  h5: { fontSize: FONT_SIZES.display, lineHeight: '32px', fontWeight: FONT_WEIGHTS.bold },
  h6: { fontSize: FONT_SIZES.subheading, lineHeight: '24px', fontWeight: FONT_WEIGHTS.bold },
  subtitle1: tracked,
  subtitle2: tracked,
  body1: tracked,
  body2: tracked,
  caption: tracked,
  button: tracked,
};

// Cards keep the page's flat look: the same hairline and radius as the learner cards.
const paperOverrides = (pal) => ({
  styleOverrides: { outlined: { borderRadius: RADII_PX.card, borderColor: pal.border } },
});

// Tabs become the learner chips: tonal when idle, accent when selected, no underline.
const tabsOverrides = {
  styleOverrides: {
    root: { minHeight: SIZES.libraryControl.chip },
    flexContainer: ({ theme }) => ({ gap: theme.spacing(1) }),
    indicator: { display: 'none' },
  },
};

const tabOverrides = (pal) => ({
  styleOverrides: {
    root: ({ theme }) => ({
      minWidth: SIZES.flexShrinkMinWidth,
      minHeight: SIZES.libraryControl.chip,
      height: SIZES.libraryControl.chip,
      paddingBlock: 0,
      paddingInline: theme.spacing(2),
      borderRadius: RADII_PX.pill,
      textTransform: 'none',
      fontWeight: FONT_WEIGHTS.medium,
      fontSize: FONT_SIZES.bodyLg,
      letterSpacing: LIB_TRACKING,
      backgroundColor: pal.chip,
      color: pal.chipText,
      '&.Mui-selected': { backgroundColor: LIB_ACCENT, color: COLOR_PALETTE.white, fontWeight: FONT_WEIGHTS.medium },
    }),
  },
});

// Single-line fields are tonal pills like the learner search box; multi-line fields keep a soft rounded rectangle.
const fieldOverrides = (pal) => ({
  styleOverrides: {
    root: ({ theme }) => ({
      backgroundColor: pal.player,
      borderRadius: RADII_PX.card,
      '&:not(.MuiInputBase-multiline)': { borderRadius: RADII_PX.pill, minHeight: SIZES.libraryControl.field, paddingInline: theme.spacing(0.5) },
      '& .MuiOutlinedInput-notchedOutline': { borderColor: pal.border },
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: pal.border },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: LIB_ACCENT },
    }),
  },
});

const containedHover = `color-mix(in srgb, ${LIB_ACCENT} 85%, ${COLOR_PALETTE.black})`;

// Primary actions are accent pills; secondary (outlined) actions are tonal pills without a border.
// Other colours (error, success) keep their own colour and only take the pill shape.
const buttonOverrides = (pal) => ({
  defaultProps: { disableElevation: true },
  styleOverrides: {
    root: ({ theme }) => ({ borderRadius: RADII_PX.pill, textTransform: 'none', fontWeight: FONT_WEIGHTS.medium, letterSpacing: LIB_TRACKING, whiteSpace: 'nowrap', paddingInline: theme.spacing(3) }),
    sizeMedium: { minHeight: SIZES.libraryControl.field, fontSize: FONT_SIZES.title },
    sizeSmall: { minHeight: SIZES.libraryControl.buttonSmall, fontSize: FONT_SIZES.bodyLg },
    containedPrimary: { backgroundColor: LIB_ACCENT, color: COLOR_PALETTE.white, '&:hover': { backgroundColor: containedHover } },
    outlinedPrimary: { backgroundColor: pal.player, borderColor: 'transparent', color: pal.text, '&:hover': { backgroundColor: pal.player, borderColor: 'transparent', filter: 'brightness(0.97)' } },
  },
});

// Table headers read as quiet captions; rows are separated by the Library hairline.
const tableCellOverrides = (pal) => ({
  styleOverrides: {
    root: { borderBottomColor: pal.divider },
    head: { color: pal.muted, fontWeight: FONT_WEIGHTS.semibold },
  },
});

const alertOverrides = { styleOverrides: { root: { borderRadius: RADII_PX.card } } };

export const adminPhoneThemeOptions = (pal) => ({
  typography: typographyOptions,
  components: {
    MuiPaper: paperOverrides(pal),
    MuiTabs: tabsOverrides,
    MuiTab: tabOverrides(pal),
    MuiOutlinedInput: fieldOverrides(pal),
    MuiButton: buttonOverrides(pal),
    MuiTableCell: tableCellOverrides(pal),
    MuiAlert: alertOverrides,
  },
});
