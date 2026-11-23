import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import useStoreData from '../../store/common/useStoreData';
import { useCheckoutFlow } from '../../store/common/useStoreInteraction';
import { flattenLessons, groupBySection, withProgress } from './courseSelectors';

const TABS = ['courses', 'lessons'];
const ignoreTab = () => {};

// Which list is open, kept in the address (?tab=lessons) so the choice survives a refresh.
function useCoursesTab() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const tab = TABS.includes(requested) ? requested : TABS[0];
  const setTab = (value) => setParams(value === TABS[0] ? {} : { tab: value }, { replace: true });
  return { tab, setTab };
}

// Everything the Courses page needs, shared by the phone and desktop layouts. Courses are Store items, so the catalog,
// the learner's progress, buying with coins and the course panel all come from the Store hooks.
export default function useCoursesPage() {
  const store = useStoreData();
  const checkout = useCheckoutFlow({ isAuthenticated: store.isAuthenticated, refresh: store.refresh, setTab: ignoreTab });
  const { tab, setTab } = useCoursesTab();
  const courseList = useMemo(() => withProgress(store.data?.items, store.courses), [store.data, store.courses]);
  const sections = useMemo(() => groupBySection(courseList, store.data?.courseSections), [courseList, store.data]);
  const lessons = useMemo(() => flattenLessons(courseList), [courseList]);
  return { ...store, ...checkout, tab, setTab, courseList, sections, lessons };
}
