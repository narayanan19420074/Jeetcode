// Look of every butterfly tier. Ids match server/src/config/butterflies.js (the server owns names, prices and levels;
// this file only owns colours). Colours follow the rarity colours players already know: grey, green, blue, purple,
// orange, red. A tier the server knows but this file does not falls back to the first one.
//
// main / light / deep = wing bands (body colour, highlight, dark edge band), accent = eye spots + antenna tips,
// body = thorax, gear = 0-3 extras (crest from 2, spinning aura ring from 3).

export const PALETTES = {
  scout: { main: '#AEB8C8', light: '#E9EEF6', deep: '#5B667A', accent: '#FFC933', body: '#2B3345', gear: 0 },
  ranger: { main: '#2ED573', light: '#A5F7C5', deep: '#0E8A47', accent: '#FFC933', body: '#12301F', gear: 1 },
  striker: { main: '#27B6FF', light: '#A5E3FF', deep: '#0B6FB5', accent: '#FF7A00', body: '#0B2A44', gear: 1 },
  phantom: { main: '#A855F7', light: '#DDB8FF', deep: '#6A21B8', accent: '#FFC933', body: '#26103F', gear: 2 },
  blaze: { main: '#FF7A00', light: '#FFC266', deep: '#C24A00', accent: '#FFE14D', body: '#3A1A06', gear: 3 },
  inferno: { main: '#FF3B4A', light: '#FF9AA2', deep: '#B0141F', accent: '#FFC933', body: '#3A0A10', gear: 3 },
};

export const paletteFor = (id) => PALETTES[id] || PALETTES.scout;
