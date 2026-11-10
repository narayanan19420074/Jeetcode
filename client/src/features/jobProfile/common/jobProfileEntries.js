import { ENTRY_SECTIONS } from './jobProfileConfig';

// index === null means "add at the end".
export const upsertAt = (list, index, entry) => (index === null ? [...list, entry] : list.map((item, position) => (position === index ? entry : item)));

export const removeAt = (list, index) => list.filter((_, position) => position !== index);

// Entries saved before a field existed come back without it; filling them from the blank entry keeps
// every form input controlled and every save complete.
export const normalizeProfile = (profile) => ({
  ...profile,
  ...Object.fromEntries(Object.values(ENTRY_SECTIONS).map(({ key, blank }) => [key, (profile[key] ?? []).map((entry) => ({ ...blank, ...entry }))])),
});
