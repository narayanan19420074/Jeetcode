import { useMediaQuery } from '@mui/material';
import { useParams } from 'react-router-dom';
import MobilePractice from './components/MobilePractice';
import usePracticeList from './practice/common/usePracticeList';
import PracticeDesktopView from './practice/desktop/PracticeDesktopView';

// Phone screen: unchanged, it only receives the values from the shared hook.
function PracticePhoneView({ practice }) {
  const { slug, hub, list, error, dismissError, filters, searchDraft, setSearchDraft, update, clearFilters, filtersActive, pageCount, picking, pickRandom } = practice;
  return (
    <MobilePractice
      slug={slug}
      hub={hub}
      list={list}
      error={error}
      onDismissError={dismissError}
      subPattern={filters.subPattern}
      difficulty={filters.difficulty}
      status={filters.status}
      search={filters.search}
      searchDraft={searchDraft}
      onSearchDraft={setSearchDraft}
      onUpdate={update}
      onClear={clearFilters}
      filtersActive={filtersActive}
      page={filters.page}
      pageCount={pageCount}
      picking={picking}
      onPick={pickRandom}
    />
  );
}

// Thin entry of /aptitude/:slug/practice: phones and small tablets get their own layout (the site navbar is hidden
// there, see MainLayout); desktop uses the three-column frame.
export default function AptitudePracticePage() {
  const { slug } = useParams();
  const practice = usePracticeList(slug);
  const isPhone = useMediaQuery((theme) => theme.breakpoints.down('md'), { noSsr: true });
  return isPhone ? <PracticePhoneView practice={practice} /> : <PracticeDesktopView practice={practice} />;
}
