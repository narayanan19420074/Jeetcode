import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { problemsApi } from '../../../../api/problemsApi';
import useProblemLists from '../../useProblemLists';
import { featuredPageForToday } from '../../dashboardUtils';
import { DIFFICULTIES, sumDifficulties } from './problemsConstants';

// The daily problem is picked from the page number for today, so every learner sees the same one on a given day.
function fetchFeaturedProblem(totals) {
  const total = sumDifficulties(totals);
  return total > 0 ? problemsApi.list({ page: featuredPageForToday(total), limit: 1 }) : null;
}

export function useProgressAndFeatured(isAuthenticated) {
  const [progress, setProgress] = useState(null);
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    let cancelled = false;
    problemsApi
      .getProgress()
      .then(({ data }) => {
        if (cancelled) return null;
        setProgress(data.data);
        return fetchFeaturedProblem(data.data.total);
      })
      .then((res) => {
        if (!cancelled && res) setFeatured(res.data.data.items[0] || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return { progress, featured };
}

// Deep links such as /problems?company=TCS&tag=Array&difficulty=Hard (used by Company Prep) seed the library filters.
function useLibraryPreset() {
  const [params] = useSearchParams();
  const urlKey = params.toString();
  return useMemo(() => {
    const search = new URLSearchParams(urlKey);
    const tags = search.getAll('tag');
    const companies = search.getAll('company');
    const requested = search.get('difficulty');
    const difficulty = DIFFICULTIES.includes(requested) ? requested : undefined;
    if (!tags.length && !companies.length && !difficulty) return null;
    return { tags, companies, difficulty };
  }, [urlKey]);
}

// A problem saved in several lists still counts once.
function useSavedProblemCount(lists) {
  return useMemo(() => {
    const ids = new Set();
    lists.forEach((list) => list.items.forEach((item) => ids.add(item._id)));
    return ids.size;
  }, [lists]);
}

export default function useProblemsPageData(isAuthenticated, userId) {
  const listsApi = useProblemLists(userId);
  const { progress, featured } = useProgressAndFeatured(isAuthenticated);
  const preset = useLibraryPreset();
  const savedCount = useSavedProblemCount(listsApi.lists);
  return { listsApi, progress, featured, preset, savedCount };
}
