import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { aptitudeApi } from '../../../../api/aptitudeApi';
import { extractErrorMessage } from '../../../../api/apiClient';

export const PRACTICE_PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 350;

// The filters live in the URL so a filtered list can be shared and the back button restores it.
function usePracticeFilters() {
  const [params, setParams] = useSearchParams();
  const filters = {
    subPattern: params.get('subPattern') || '',
    difficulty: params.get('difficulty') || '',
    status: params.get('status') || '',
    search: params.get('search') || '',
    page: Math.max(1, parseInt(params.get('page'), 10) || 1),
  };
  // Any filter change goes back to page 1, because the old page number may not exist in the new result.
  const update = useCallback((patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  }, [params, setParams]);
  const clear = useCallback(() => setParams({}, { replace: true }), [setParams]);
  return { filters, update, clear };
}

function usePatternHub(slug, setError) {
  const [hub, setHub] = useState(null);
  useEffect(() => {
    let cancelled = false;
    aptitudeApi.getPattern(slug)
      .then(({ data }) => !cancelled && setHub(data.data))
      .catch((err) => !cancelled && setError(extractErrorMessage(err)));
    return () => { cancelled = true; };
  }, [slug, setError]);
  return hub;
}

function useQuestionList(slug, filters, setError) {
  const [list, setList] = useState(null);
  const { subPattern, difficulty, status, search, page } = filters;
  useEffect(() => {
    let cancelled = false;
    setList(null);
    aptitudeApi.listPracticeQuestions(slug, { subPattern, difficulty, status, search, page, limit: PRACTICE_PAGE_SIZE })
      .then(({ data }) => !cancelled && setList(data.data))
      .catch((err) => !cancelled && setError(extractErrorMessage(err)));
    return () => { cancelled = true; };
  }, [slug, subPattern, difficulty, status, search, page, setError]);
  return list;
}

// Typing in the search box updates the URL only after a short pause, so every key press does not reload the list.
function useSearchDraft(search, update) {
  const [searchDraft, setSearchDraft] = useState(search);
  useEffect(() => {
    if (searchDraft === search) return undefined;
    const timer = setTimeout(() => update({ search: searchDraft.trim() }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchDraft, search, update]);
  return { searchDraft, setSearchDraft };
}

// "Pick one": opens a random question that is not solved yet, inside the current filters.
function usePickRandom(slug, filters, setError) {
  const navigate = useNavigate();
  const [picking, setPicking] = useState(false);
  const pickRandom = async () => {
    setPicking(true);
    try {
      const { subPattern, difficulty, search, status } = filters;
      const unsolvedStatus = status && status !== 'solved' ? status : 'unsolved';
      const { data } = await aptitudeApi.listPracticeQuestions(slug, { subPattern, difficulty, search, status: unsolvedStatus, limit: 100 });
      const pool = data.data.items;
      if (pool.length === 0) setError('Nothing unsolved in this filter — nice work!');
      else navigate(`/aptitude/${slug}/practice/${pool[Math.floor(Math.random() * pool.length)]._id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setPicking(false);
    }
  };
  return { picking, pickRandom };
}

// Everything the phone and the desktop practice pages share: filters, data, search draft and "Pick one".
export default function usePracticeList(slug) {
  const [error, setError] = useState(null);
  const { filters, update, clear } = usePracticeFilters();
  const hub = usePatternHub(slug, setError);
  const list = useQuestionList(slug, filters, setError);
  const { searchDraft, setSearchDraft } = useSearchDraft(filters.search, update);
  const { picking, pickRandom } = usePickRandom(slug, filters, setError);
  const subTitles = useMemo(() => Object.fromEntries((hub?.practice.bySubPattern ?? []).map((topic) => [topic.slug, topic.title])), [hub]);
  const { subPattern, difficulty, status, search } = filters;
  const clearFilters = () => { setSearchDraft(''); clear(); };
  return {
    slug, hub, list, error, filters, update, subTitles, searchDraft, setSearchDraft, picking, pickRandom, clearFilters,
    dismissError: () => setError(null),
    filtersActive: Boolean(subPattern || difficulty || status || search),
    pageCount: list ? Math.max(1, Math.ceil(list.total / PRACTICE_PAGE_SIZE)) : 1,
  };
}
