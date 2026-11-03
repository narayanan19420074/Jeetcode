import { COLOR_PALETTE } from '../../app/design/designTokens';
// Look of every butterfly tier. Ids match server/src/config/butterflies.js (the server owns names, prices and levels;
// this file only owns colours). Colours follow the rarity colours players already know: grey, green, blue, purple,
// orange, red. A tier the server knows but this file does not falls back to the first one.
//
// main / light / deep = wing bands (body colour, highlight, dark edge band), accent = eye spots + antenna tips,
// body = thorax, gear = 0-3 extras (crest from 2, spinning aura ring from 3).

export const PALETTES = {
  scout: { main: COLOR_PALETTE.custom.grayAEB8C8, light: COLOR_PALETTE.slate[200], deep: COLOR_PALETTE.custom.slate5B667A, accent: COLOR_PALETTE.amber[400], body: COLOR_PALETTE.slate[800], gear: 0 },
  ranger: { main: COLOR_PALETTE.custom.green2ED573, light: COLOR_PALETTE.custom.emeraldA5F7C5, deep: COLOR_PALETTE.green[700], accent: COLOR_PALETTE.amber[400], body: COLOR_PALETTE.custom.emerald12301F, gear: 1 },
  striker: { main: COLOR_PALETTE.custom.sky27B6FF, light: COLOR_PALETTE.custom.skyA5E3FF, deep: COLOR_PALETTE.custom.sky0B6FB5, accent: COLOR_PALETTE.custom.orangeFF7A00, body: COLOR_PALETTE.sky[950], gear: 1 },
  phantom: { main: COLOR_PALETTE.purple[500], light: COLOR_PALETTE.purple[300], deep: COLOR_PALETTE.violet[800], accent: COLOR_PALETTE.amber[400], body: COLOR_PALETTE.custom.indigo26103F, gear: 2 },
  blaze: { main: COLOR_PALETTE.custom.orangeFF7A00, light: COLOR_PALETTE.custom.orangeFFC266, deep: COLOR_PALETTE.custom.orangeC24A00, accent: COLOR_PALETTE.yellow[300], body: COLOR_PALETTE.custom.yellow3A1A06, gear: 3 },
  inferno: { main: COLOR_PALETTE.custom.redFF3B4A, light: COLOR_PALETTE.custom.roseFF9AA2, deep: COLOR_PALETTE.custom.redB0141F, accent: COLOR_PALETTE.amber[400], body: COLOR_PALETTE.custom.red3A0A10, gear: 3 },
};

export const paletteFor = (id) => PALETTES[id] || PALETTES.scout;
