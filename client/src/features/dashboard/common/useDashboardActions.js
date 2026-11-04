import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { problemsApi } from '../../../api/problemsApi';
import { extractErrorMessage } from '../../../api/apiClient';

const toProblemsUrl = ({ tags = [], companies = [] }) => {
  const query = new URLSearchParams();
  tags.forEach((tag) => query.append('tag', tag));
  companies.forEach((company) => query.append('company', company));
  const queryString = query.toString();
  return queryString ? `/problems?${queryString}` : '/problems';
};

// "Browse by topic or company" from Explore and list views. Phones have no library on the dashboard, so they open
// the Problems page with the same filters. Wide screens return to the library, pre-filtered.
export function useBrowseProblems({ isMdUp, goView, setPreset }) {
  const navigate = useNavigate();
  return useCallback(
    (filters = {}) => {
      if (!isMdUp) {
        navigate(toProblemsUrl(filters));
        return;
      }
      if (filters.tags || filters.companies) setPreset({ tags: filters.tags || [], companies: filters.companies || [] });
      goView('library');
    },
    [goView, isMdUp, navigate, setPreset]
  );
}

// Opens a random problem. Signed-in people only get problems they have not solved yet.
export function usePickRandomProblem(isAuthenticated) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  return useCallback(
    (difficulty) =>
      problemsApi
        .getRandom({ difficulty: difficulty || undefined, status: isAuthenticated ? 'unsolved' : undefined })
        .then(({ data }) => navigate(`/workspace/${data.data.slug}`))
        .catch((err) => enqueueSnackbar(extractErrorMessage(err), { variant: 'warning' })),
    [isAuthenticated, navigate, enqueueSnackbar]
  );
}
