import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Which lesson or topic is open, kept in the address (?lesson= or ?topic=) so a refresh or a shared link opens the same one.
// Without a valid choice the first item that is not finished opens, so the learner resumes where they stopped.
export default function useRouteSelection({ ids, paramName, completed }) {
  const [params, setParams] = useSearchParams();
  const requested = params.get(paramName);
  const activeId = ids.includes(requested) ? requested : ids.find((id) => !completed.has(id)) ?? ids[0];
  const select = useCallback((id) => setParams({ [paramName]: id }, { replace: true }), [paramName, setParams]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [activeId]);
  return { activeId, activeIndex: ids.indexOf(activeId), select };
}
