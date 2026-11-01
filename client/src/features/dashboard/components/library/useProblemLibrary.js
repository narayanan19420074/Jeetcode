import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { problemsApi } from '../../../../api/problemsApi';
import { extractErrorMessage } from '../../../../api/apiClient';
import { CATEGORY_GROUPS } from '../../dashboardUtils';
import { INITIAL_QUERY, countActiveFilters, toRandomParams } from './libraryConstants';
import { focusSearchOnSlash, handleArrowKey } from './libraryKeyboard';
import useLibraryList from './useLibraryList';

const SEARCH_DEBOUNCE_MS = 300;
const LOAD_NEXT_PAGE_MARGIN = '0px 0px 240px 0px';

// One-time lookups for the topic chips and company filter.
function useLibraryLookups() {
  const [tags, setTags] = useState([]);
  const [companies, setCompanies] = useState([]);
  useEffect(() => {
    problemsApi.getTags().then(({ data }) => setTags(data.data.items)).catch(() => setTags([]));
    problemsApi.getCompanies().then(({ data }) => setCompanies(data.data.items)).catch(() => setCompanies([]));
  }, []);
  return { tags, companies };
}

// Topic groups only show tags that exist in the database, so a new or missing tag never breaks a group.
function useTopicGroups(tags) {
  return useMemo(() => {
    const available = new Set(tags.map((t) => t.tag));
    return CATEGORY_GROUPS.map((g) => ({ ...g, tags: g.tags.filter((t) => available.has(t)) })).filter((g) => g.tags.length > 0);
  }, [tags]);
}

// Filters, sort, page and the search box. Changing anything except the page goes back to page 1.
function useLibraryQuery(preset) {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [searchText, setSearchText] = useState('');
  const patch = useCallback((changes, keepPage = false) => setQuery((prev) => ({ ...prev, ...changes, ...(keepPage ? {} : { page: 1 }) })), []);

  // "Browse by company/topic" from the Explore view lands here pre-filtered.
  useEffect(() => {
    if (!preset) return;
    setSearchText('');
    setQuery({ ...INITIAL_QUERY, difficulty: preset.difficulty || 'All', tags: preset.tags || [], companies: preset.companies || [] });
  }, [preset]);

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      const next = searchText.trim();
      setQuery((prev) => (prev.search === next ? prev : { ...prev, search: next, page: 1 }));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchText]);

  const clearAll = useCallback(() => {
    setSearchText('');
    setQuery({ ...INITIAL_QUERY });
  }, []);
  return { query, setQuery, patch, searchText, setSearchText, clearAll };
}

// Loads the next page when the sentinel at the bottom of the card scrolls into view.
function useInfiniteScroll({ listRef, sentinelRef, enabled, itemCount, onLoadMore }) {
  useEffect(() => {
    const root = listRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel || !enabled) return undefined;
    const observer = new IntersectionObserver(
      (entries) => entries.some((entry) => entry.isIntersecting) && onLoadMore(),
      { root, rootMargin: LOAD_NEXT_PAGE_MARGIN }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [listRef, sentinelRef, enabled, itemCount, onLoadMore]);
}

function useLibraryShortcuts({ searchRef, cardRef, listRef }) {
  useEffect(() => {
    const onKey = (event) => focusSearchOnSlash(event, searchRef.current);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchRef]);

  useEffect(() => {
    const onKey = (event) => handleArrowKey(event, cardRef.current, listRef.current);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cardRef, listRef]);
}

// With only the default Favorite list, one click saves or unsaves. With several lists a menu opens.
function useSaveToList(listsApi) {
  const { enqueueSnackbar } = useSnackbar();
  const [saveAnchor, setSaveAnchor] = useState(null);
  const [saveProblem, setSaveProblem] = useState(null);

  const handleStar = (anchor, problem) => {
    if (listsApi.lists.length !== 1) {
      setSaveAnchor(anchor);
      setSaveProblem(problem);
      return;
    }
    const wasSaved = listsApi.lists[0].items.some((i) => i._id === problem._id);
    listsApi.toggleItem('favorite', problem);
    enqueueSnackbar(wasSaved ? 'Removed from Favorite' : 'Added to Favorite', { variant: 'default', autoHideDuration: 1800 });
  };
  const closeSaveMenu = () => {
    setSaveAnchor(null);
    setSaveProblem(null);
  };
  return { saveAnchor, saveProblem, handleStar, closeSaveMenu };
}

// Opens a random problem that matches the filters currently applied.
function useRandomProblem(query) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [picking, setPicking] = useState(false);

  const pickOne = () => {
    setPicking(true);
    problemsApi
      .getRandom(toRandomParams(query))
      .then(({ data }) => navigate(`/workspace/${data.data.slug}`))
      .catch((err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'warning' }))
      .finally(() => setPicking(false));
  };
  return { picking, pickOne };
}

const toggleIn = (list, value) => (list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

function useLibraryFilters(query, patch) {
  const filterCount = countActiveFilters(query);
  return {
    filterCount,
    anyActive: filterCount > 0 || query.tags.length > 0 || query.search !== '',
    sortDisabled: query.search !== '',
    toggleTag: (tag) => patch({ tags: toggleIn(query.tags, tag) }),
    toggleCompany: (company) => patch({ companies: toggleIn(query.companies, company) }),
  };
}

function useLibraryPaging(refs, list, setQuery) {
  const hasMore = list.pagination.page < list.pagination.totalPages;
  const busy = list.loading || list.refetching || list.loadingMore || Boolean(list.error);
  const onLoadMore = useCallback(() => setQuery((prev) => ({ ...prev, page: prev.page + 1 })), [setQuery]);
  useInfiniteScroll({ ...refs, enabled: hasMore && !busy, itemCount: list.items.length, onLoadMore });
}

// State and behaviour of the problem library, shared by every look of it.
export default function useProblemLibrary({ preset, listsApi }) {
  const search = useLibraryQuery(preset);
  const { tags, companies } = useLibraryLookups();
  const refs = { searchRef: useRef(null), cardRef: useRef(null), listRef: useRef(null), sentinelRef: useRef(null) };
  const list = useLibraryList(search.query, refs.listRef);
  useLibraryPaging(refs, list, search.setQuery);
  useLibraryShortcuts(refs);

  return {
    ...refs,
    ...list,
    ...search,
    tags,
    companies,
    groups: useTopicGroups(tags),
    ...useLibraryFilters(search.query, search.patch),
    ...useSaveToList(listsApi),
    ...useRandomProblem(search.query),
  };
}
