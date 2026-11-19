import { env } from '../config/env.js';
import { PlatformSetting } from '../models/PlatformSetting.js';

const SETTINGS_KEY = 'global';

// Pro checks run on many hot routes (problem lists, mock tests, community),
// so the setting is cached briefly instead of read from the database on every
// request. The short lifetime keeps a change made on another server instance
// visible within seconds; this instance refreshes immediately on update.
const CACHE_TTL_MS = 15000;

let cachedProForEveryone = null;
let cachedAt = 0;

const isCacheFresh = () => cachedProForEveryone !== null && Date.now() - cachedAt < CACHE_TTL_MS;

const rememberProForEveryone = (value) => {
  cachedProForEveryone = value;
  cachedAt = Date.now();
};

async function readProForEveryoneFlag() {
  if (isCacheFresh()) return cachedProForEveryone;
  const setting = await PlatformSetting.findOne({ key: SETTINGS_KEY }).select('proForEveryone').lean();
  rememberProForEveryone(Boolean(setting?.proForEveryone));
  return cachedProForEveryone;
}

// The older launch offer (FREE_ACCESS_UNTIL) still works alongside the admin switch.
const isLaunchOfferActive = () =>
  Boolean(env.FREE_ACCESS_UNTIL) && new Date() < new Date(env.FREE_ACCESS_UNTIL);

// True when Pro must be treated as granted to every signed-in user.
export async function isProGrantedToEveryone() {
  if (isLaunchOfferActive()) return true;
  return readProForEveryoneFlag();
}

export async function getPlatformSettings() {
  return { proForEveryone: await readProForEveryoneFlag() };
}

export async function setProForEveryone({ enabled, adminId }) {
  await PlatformSetting.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $set: { proForEveryone: enabled, updatedBy: adminId } },
    { upsert: true, setDefaultsOnInsert: true }
  );
  rememberProForEveryone(enabled);
  return { proForEveryone: enabled };
}
