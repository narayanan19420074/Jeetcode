// The butterfly on the Quests page levels up with diamonds. Tier n is bought after tier n-1, in this order.
// Diamonds come from converting coins (COINS_PER_DIAMOND coins = 1 diamond) on the Quests page.
// The 3D look of each tier (wing colours) lives in the client: client/src/features/quests/butterflyCatalog.js
// and is matched by `id`, so keep the ids in sync when adding one. Rarity names/colours follow the usual
// game ladder: Common (grey), Uncommon (green), Rare (blue), Epic (purple), Legendary (orange), Mythic (red).
//
// cost = diamonds. Tier 1 is free and every account starts on it. A level is just how many tiers the user has
// bought, so renaming an id here does not break existing accounts.

export const COINS_PER_DIAMOND = 100;
export const MAX_CONVERT = 500; // diamonds per request

export const BUTTERFLIES = [
  { id: 'scout', name: 'Scout', rarity: 'Common', cost: 0 },
  { id: 'ranger', name: 'Ranger', rarity: 'Uncommon', cost: 2 },
  { id: 'striker', name: 'Striker', rarity: 'Rare', cost: 5 },
  { id: 'phantom', name: 'Phantom', rarity: 'Epic', cost: 10 },
  { id: 'blaze', name: 'Blaze', rarity: 'Legendary', cost: 20 },
  { id: 'inferno', name: 'Inferno', rarity: 'Mythic', cost: 40 },
];
