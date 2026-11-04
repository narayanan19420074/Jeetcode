// JeetCode design tokens: the single source of truth for every visual decision.
//
// Colours, typography, spacing, radii, sizing, elevation, motion and breakpoints are defined here and nowhere
// else. The MUI theme (app/design/buildTheme.js) and every legacy palette (Library, Workspace, Leaderboard,
// Quests/Store) read from this file, so one edit restyles the whole product on mobile and desktop.
//
// Rule for contributors: never write a raw hex colour, a font size or a radius in a component. Use the theme
// (palette, typography variants, spacing, shape) or import a token from this file.
//
// The tokens live in app/design/tokens/, one file per group, and are re-exported here so every import stays
// `from '<path>/app/design/designTokens'`. Add a new token to the group file it belongs to.
export * from './tokens/layout.js';
export * from './tokens/typography.js';
export * from './tokens/colors.js';
export * from './tokens/colorPalette.js';
export * from './tokens/elevationMotion.js';
export * from './tokens/pages.js';
