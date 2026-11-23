const storageKey = (slug) => `jeetcode.course.${slug}.done`;

// Finished lessons of a built-in course, kept in this browser. Built-in courses are free and need no account, so
// their progress is saved on the device instead of on the server.
export function readDoneKeys(slug) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(slug)) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((key) => typeof key === 'string') : [];
  } catch {
    return [];
  }
}

export function writeDoneKeys(slug, keys) {
  try {
    window.localStorage.setItem(storageKey(slug), JSON.stringify(keys));
  } catch {
    // Storage can be blocked (private browsing, full quota). Progress then lasts only until the page is closed.
  }
}
