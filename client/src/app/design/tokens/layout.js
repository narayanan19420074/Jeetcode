// Layout tokens: breakpoints, spacing, radii and component sizes.
// Re-exported by app/design/designTokens.js: import from there, not from this file.

// ---------------------------------------------------------------- breakpoints
// Mobile is everything below `md`; desktop is `md` and up. This matches theme.breakpoints.down('md').
export const BREAKPOINTS = { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 };

// ---------------------------------------------------------------- spacing
// One spacing unit feeds theme.spacing(n). Use multiples (sx={{ p: 2 }} = 16px) instead of pixel values.
export const SPACING = { unit: 8, compactUnit: 7 };

// Named layout gaps, in spacing units, for page-level rhythm. Mobile gutters are tighter than desktop.
export const LAYOUT_SPACING = {
  pageGutter: { xs: 2, md: 3 },
  sectionGap: { xs: 3, md: 4 },
  cardPadding: { xs: 2, md: 2.5 },
  stackGap: { xs: 1.5, md: 2 },
};

// ---------------------------------------------------------------- shape
// Radii in pixels. Pick the role, not a number: badge (tiny tags), control (buttons, inputs, list rows, panels),
// card, dialog and pill (filter chips, tags, avatars). The theme shape uses `control`, so a numeric
// `borderRadius: 1` in an sx prop equals one control radius; prefer a role from this list instead.
export const RADII = { badge: 4, control: 8, card: 12, dialog: 16, pill: 999 };

// The same radii as CSS pixel strings for sx props. A bare number in sx is multiplied by the theme shape
// (`borderRadius: 2` = 16px), while a string is used exactly as written, so components pass `RADII_PX.card`.
export const RADII_PX = {
  ...Object.fromEntries(Object.entries(RADII).map(([role, value]) => [role, `${value}px`])),
  // Square corners (used to drop the card radius on phones) and fully round shapes (dots, avatars).
  square: '0px',
  circle: '50%',
};

// ---------------------------------------------------------------- sizing
export const SIZES = {
  // WCAG 2.5.5 / Material: minimum touch target on phones.
  touchTarget: 44,
  controlHeight: { mobile: 44, desktop: 36 },
  iconButton: { mobile: 40, desktop: 32 },
  appBarHeight: { mobile: 56, desktop: 64 },
  bottomNavHeight: 64,
  // Icon pill of one bottom navigation tab.
  bottomNavTabIcon: { width: 64, height: 32 },
  iconSize: { small: 18, medium: 24, large: 28 },
  chipIconSize: 16,
  // Rows and chips: one height per role so lists, sidebars and filter bars line up across pages.
  listRowHeight: 44,
  listRowHeightDense: 36,
  navItemHeight: 40,
  // Thickness of the bottom border that marks the active navigation link.
  navActiveIndicator: 2,
  // Top bar on phones, and the rows and tiles of the phone menu and account dropdown.
  navbarHeightPhone: 60,
  menuRowHeight: 48,
  navAvatar: 34,
  accountMenuMinWidth: { desktop: 220, mobile: 288 },
  drawerWidth: 'min(88vw, 360px)',
  viewportHeight: '100dvh',
  // Lets a flex child shrink below its content width so long text can truncate with an ellipsis.
  flexShrinkMinWidth: 0,
  // Same for a scrolling pane inside a flex or grid layout: it may shrink below its content height and scroll.
  flexShrinkMinHeight: 0,
  // Full width or height of the parent (cards in a grid row, buttons that fill their container).
  fill: '100%',
  // Fake browser frame around the landing page screenshots: title bar height and window dot size.
  browserBarHeight: 22,
  browserDot: 7,
  // Maximum width of a section heading block on the landing page.
  headingMaxWidth: { default: 680, narrow: 560 },
  // Width of the sign in and sign up cards.
  authCardWidth: 340,
  // One cell of the contest countdown (days, hours, minutes, seconds).
  countdownCell: 52,
  // Code visualizer (workspace dialog): dialog size, the code pane height on phones, the line-number column and
  // the smallest box a value is drawn in.
  codeVisualizer: { dialogMaxWidth: 1240, dialogHeight: '90dvh', phoneCodeHeight: '32dvh', lineNumberColumn: 44, valueBox: 28, speedSelect: 96, outputMaxHeight: '40%' },
  filterPillHeight: 40,
  chipHeight: 28,
  chipHeightSmall: 24,
  // `post` is the author photo on a feed post.
  avatar: { xs: 24, sm: 32, md: 40, post: 48, lg: 56 },
  contentMaxWidth: 1200,
  // Widest the dashboard grows (sidebar, content and streak rail together) on very large screens.
  dashboardMaxWidth: 1480,
  // Left column of a phone problem row: the difficulty tag above the solved marker.
  problemDifficultyColumn: 43,
  readingMaxWidth: 720,
  // Preview of an attached image on the compose screen.
  composeThumbnail: 80,
  // Page scrollbars: regular on desktop, slim on phones, thin for auto-hide panels.
  scrollbar: { regular: 10, slim: 4, thin: 6 },
};

// The photo of a feed post is always shown in this frame (portrait 4:5, the largest portrait shape LinkedIn feeds show), so
// every post keeps the same layout. `outputWidth` is the pixel width of an image cropped to this frame before upload.
export const FEED_IMAGE_FRAME = { aspectRatio: '4 / 5', widthPerHeight: 4 / 5, outputWidth: 1080 };
