// The butterfly on the Quests page levels up with diamonds. Tier n is bought after tier n-1, in this order.
// Diamonds come from converting coins (COINS_PER_DIAMOND coins = 1 diamond) on the Quests page.
// The 3D look of each tier (wing colours) lives in the client: client/src/features/quests/butterflyCatalog.js
// and is matched by `id`, so keep the ids in sync when adding one.
//
// cost = diamonds. Tier 1 is free and every account starts on it.

export const COINS_PER_DIAMOND = 100;
export const MAX_CONVERT = 500; // diamonds per request

export const BUTTERFLIES = [
  { id: 'amethyst', name: 'Amethyst', rarity: 'Common', cost: 0 },
  { id: 'sapphire', name: 'Sapphire', rarity: 'Uncommon', cost: 2 },
  { id: 'emerald', name: 'Emerald', rarity: 'Rare', cost: 5 },
  { id: 'rose', name: 'Rose Quartz', rarity: 'Epic', cost: 10 },
  { id: 'topaz', name: 'Golden Topaz', rarity: 'Legendary', cost: 20 },
  { id: 'opal', name: 'Aurora Opal', rarity: 'Mythic', cost: 40 },
];
