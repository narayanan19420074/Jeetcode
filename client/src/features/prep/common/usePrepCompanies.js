import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { prepApi } from '../../../api/prepApi';
import { problemsApi } from '../../../api/problemsApi';
import { buildCompanyList, findSelectedCompany, norm } from './companyList';

const PAGE_SIZE = 24;

function useCompanySources() {
  const [tracks, setTracks] = useState(null); // null while loading
  const [others, setOthers] = useState(null); // [{ company, count }]

  useEffect(() => {
    prepApi.listCompanies().then(({ data }) => setTracks(data.data.items || [])).catch(() => setTracks([]));
    problemsApi.getCompanies().then(({ data }) => setOthers(data.data.items || [])).catch(() => setOthers([]));
  }, []);

  return { tracks: tracks || [], others: others || [], loading: tracks === null || others === null };
}

// Infinite scroll: load the next page when the end of the list comes into view.
function useInfiniteList({ list, query, loading, paused }) {
  const sentinelRef = useRef(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  useEffect(() => setVisible(PAGE_SIZE), [query]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible((count) => count + PAGE_SIZE), { rootMargin: '300px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [list.length, visible, loading, paused]);

  return { shown: list.slice(0, visible), hasMore: visible < list.length, sentinelRef };
}

// The open company lives in the URL (?company=) so the phone's back button closes its roadmap.
function useSelectedCompany(list, tracks) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const selectedName = params.get('company');
  const selected = useMemo(() => findSelectedCompany(selectedName, list, tracks), [selectedName, list, tracks]);

  const openCompany = (company) => setParams({ company: company.name });
  const closeCompany = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else setParams({}, { replace: true });
  };
  useEffect(() => {
    if (selected) window.scrollTo?.(0, 0);
  }, [selected?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  return { selected, selectedName, openCompany, closeCompany };
}

export default function usePrepCompanies() {
  const { tracks, others, loading } = useCompanySources();
  const [query, setQuery] = useState('');
  const list = useMemo(() => buildCompanyList(tracks, others, norm(query)), [tracks, others, query]);
  const selection = useSelectedCompany(list, tracks);
  const infinite = useInfiniteList({ list, query: norm(query), loading, paused: selection.selectedName });
  return { loading, list, query, setQuery, ...infinite, ...selection };
}
