// After a new deploy, old tabs can fail to load a lazy page chunk. A single
// automatic reload fixes that, so the user never sees an error screen for it.
const CHUNK_ERROR_PATTERN = /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;
const LAST_RELOAD_KEY = 'jc_chunk_reload_at';
const RELOAD_COOLDOWN_MS = 30000;

export const isChunkLoadError = (error) => CHUNK_ERROR_PATTERN.test(String(error?.message || error));

// Session storage can be blocked (private mode); in that case we skip the reload to avoid a reload loop.
function wasReloadedRecently() {
  try {
    const lastReloadAt = Number(sessionStorage.getItem(LAST_RELOAD_KEY) || 0);
    return Date.now() - lastReloadAt < RELOAD_COOLDOWN_MS;
  } catch {
    return true;
  }
}

function rememberReload() {
  try {
    sessionStorage.setItem(LAST_RELOAD_KEY, String(Date.now()));
  } catch {
    // Nothing to remember; wasReloadedRecently already blocks the reload in this case.
  }
}

// Returns true when a reload was triggered. If we already reloaded just now, the
// chunk is genuinely broken, so the caller shows the error screen instead.
export function reloadOnceForChunkError(error) {
  if (!isChunkLoadError(error) || wasReloadedRecently()) return false;
  rememberReload();
  window.location.reload();
  return true;
}
