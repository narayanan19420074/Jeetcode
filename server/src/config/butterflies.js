// Butterfly collection on the Quests page. Prices are in coins (the same balance
// the Store uses), so tune them here and the API + page follow. The 3D look of
// each butterfly (wing colours) lives in the client: client/src/features/quests/butterflyCatalog.js
// and is matched by `id`, so keep the ids in sync when adding one.
//
// cost 0 = starter butterfly every account owns from day one.

export const DEFAULT_BUTTERFLY = 'amethyst';

export const BUTTERFLIES = [
  { id: 'amethyst', name: 'Amethyst Monarch', rarity: 'Starter', cost: 0, blurb: 'Your first wings. Purple crystal glow.' },
  { id: 'sapphire', name: 'Sapphire Glider', rarity: 'Common', cost: 150, blurb: 'Deep ocean blue with icy sparkle.' },
  { id: 'emerald', name: 'Emerald Drift', rarity: 'Rare', cost: 350, blurb: 'Forest green wings that catch the light.' },
  { id: 'rose', name: 'Rose Quartz', rarity: 'Rare', cost: 600, blurb: 'Hot pink crystal with a soft shimmer.' },
  { id: 'topaz', name: 'Golden Topaz', rarity: 'Epic', cost: 1000, blurb: 'Molten gold and amber fire.' },
  { id: 'opal', name: 'Aurora Opal', rarity: 'Legendary', cost: 1800, blurb: 'Rainbow wings that change colour as they fly.' },
];

export const BUTTERFLY_BY_ID = new Map(BUTTERFLIES.map((b) => [b.id, b]));
