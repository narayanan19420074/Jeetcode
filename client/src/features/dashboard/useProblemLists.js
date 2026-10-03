import { useCallback, useEffect, useState } from 'react';

// "My Lists" (LeetCode's Favorite + custom lists). The backend has a
// bookmark toggle but no endpoint that returns the saved problems, so lists
// live in localStorage, one store per user (guests share a "guest" store).
// Each saved problem is a small snapshot, so a list renders without any
// extra API calls.
//
// If you later add `GET /users/me/bookmarks`, only this hook needs to change.

const MAX_LISTS = 20;
const MAX_ITEMS = 500;
const keyFor = (uid) => `jeetcode-lists-v1:${uid || 'guest'}`;
const DEFAULT = () => [{ id: 'favorite', name: 'Favorite', items: [] }];

function load(uid) {
  try {
    const raw = localStorage.getItem(keyFor(uid));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length && parsed[0].id === 'favorite') return parsed;
    }
  } catch {
    /* corrupted or blocked storage — fall back to defaults */
  }
  return DEFAULT();
}

const snapshot = (p) => ({ _id: p._id, slug: p.slug, title: p.title, difficulty: p.difficulty, locked: Boolean(p.locked) });

export default function useProblemLists(userId) {
  const [lists, setLists] = useState(() => load(userId));

  useEffect(() => {
    setLists(load(userId));
  }, [userId]);

  const update = useCallback(
    (fn) => {
      setLists((prev) => {
        const next = fn(prev);
        try {
          localStorage.setItem(keyFor(userId), JSON.stringify(next));
        } catch {
          /* storage full or blocked — keep in-memory state only */
        }
        return next;
      });
    },
    [userId]
  );

  const toggleItem = useCallback(
    (listId, problem) => {
      update((prev) =>
        prev.map((l) => {
          if (l.id !== listId) return l;
          const exists = l.items.some((i) => i._id === problem._id);
          if (exists) return { ...l, items: l.items.filter((i) => i._id !== problem._id) };
          if (l.items.length >= MAX_ITEMS) return l;
          return { ...l, items: [snapshot(problem), ...l.items] };
        })
      );
    },
    [update]
  );

  // Returns the new list id, or null if the name is empty/duplicate/over the cap.
  const createList = useCallback(
    (rawName) => {
      const name = (rawName || '').trim().slice(0, 40);
      if (!name || lists.length >= MAX_LISTS) return null;
      if (lists.some((l) => l.name.toLowerCase() === name.toLowerCase())) return null;
      const id = `l_${Date.now().toString(36)}`;
      update((prev) => [...prev, { id, name, items: [] }]);
      return id;
    },
    [lists, update]
  );

  const renameList = useCallback(
    (listId, rawName) => {
      const name = (rawName || '').trim().slice(0, 40);
      if (!name || listId === 'favorite') return false;
      if (lists.some((l) => l.id !== listId && l.name.toLowerCase() === name.toLowerCase())) return false;
      update((prev) => prev.map((l) => (l.id === listId ? { ...l, name } : l)));
      return true;
    },
    [lists, update]
  );

  const deleteList = useCallback(
    (listId) => {
      if (listId === 'favorite') return;
      update((prev) => prev.filter((l) => l.id !== listId));
    },
    [update]
  );

  const isSaved = useCallback((problemId) => lists.some((l) => l.items.some((i) => i._id === problemId)), [lists]);

  return { lists, toggleItem, createList, renameList, deleteList, isSaved, maxLists: MAX_LISTS };
}
